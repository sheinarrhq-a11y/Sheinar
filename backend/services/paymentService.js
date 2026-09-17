const crypto = require("crypto");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const Order = require("../models/Order");
const Product = require("../models/Product");
const ShippingRate = require("../models/ShippingRate");
const PaymentAttempt = require("../models/PaymentAttempt");
const PaymentWebhookEvent = require("../models/PaymentWebhookEvent");
const PaymentRefund = require("../models/PaymentRefund");
const PaymentAttemptLock = require("../models/PaymentAttemptLock");
const { sendOrderConfirmationEmail } = require("../utils/email");
const { convertFromINR } = require("./currencyService");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const MAX_QUANTITY = 20;
const ATTEMPT_TTL_MS = 30 * 60 * 1000;

function publicError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function hashToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function publicAttempt(attempt) {
  if (!attempt) return null;
  return {
    id: attempt._id,
    status: attempt.status,
    chargedAmount: attempt.chargedAmount,
    chargedCurrency: attempt.chargedCurrency,
    currencyMinorUnit: attempt.currencyMinorUnit,
    razorpayOrderId: attempt.razorpayOrderId,
    expiresAt: attempt.expiresAt,
    capturedAt: attempt.capturedAt,
    completedAt: attempt.completedAt,
    failureReason: attempt.failureReason,
    cancellationReason: attempt.cancellationReason,
  };
}

function assertCustomer(customer) {
  if (!customer || typeof customer.email !== "string" || !/^\S+@\S+\.\S+$/.test(customer.email)) {
    throw publicError("Valid customer information is required.");
  }
  if (typeof customer.firstName !== "string" || !customer.firstName.trim()) {
    throw publicError("Customer name is required.");
  }
}

async function findProduct(productId) {
  const conditions = [{ slug: String(productId) }, { sku: String(productId) }];
  if (mongoose.isValidObjectId(productId)) conditions.unshift({ _id: productId });
  return Product.findOne({ $or: conditions, hidden: { $ne: true } }).lean();
}

async function calculateTrustedCart(items, shippingId, country) {
  if (!Array.isArray(items) || items.length === 0 || items.length > 100) {
    throw publicError("A valid cart is required.");
  }

  const trustedItems = [];
  for (const item of items) {
    if (!item || typeof item.productId !== "string" || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_QUANTITY) {
      throw publicError("Invalid cart item.");
    }
    const product = await findProduct(item.productId);
    if (!product || product.status === "sold-out") throw publicError("A product is unavailable.");
    if (!Number.isFinite(product.price) || product.price < 0) throw publicError("Product pricing is invalid.", 500);
    if (item.size && product.variants?.length) {
      const variant = product.variants.find((entry) => entry.size === item.size);
      if (!variant || variant.stock < item.quantity) throw publicError("Selected product size is unavailable.");
    }
    trustedItems.push({
      productId: String(product._id || product.slug),
      quantity: item.quantity,
      size: typeof item.size === "string" ? item.size : "",
      title: product.title,
      price: Number(product.price),
      weightKg: Number(product.weightKg) || 0.5,
      image: product.images?.[0]?.url || product.images?.[0] || "",
      collection: product.collection || "",
    });
  }

  const subtotal = Number(trustedItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2));
  let shippingFee = 0;
  let shippingMethod = "standard";
  if (shippingId) {
    if (!mongoose.isValidObjectId(shippingId)) throw publicError("Invalid shipping method.");
    const rate = await ShippingRate.findOne({ _id: shippingId, active: true }).lean();
    if (!rate) throw publicError("Shipping method is unavailable.");
    const scope = country === "India" ? "domestic" : "international";
    if (rate.scope !== "both" && rate.scope !== scope) throw publicError("Shipping method is unavailable for this destination.");
    shippingMethod = rate.method;
    if (rate.rateType === "flat") shippingFee = Number(rate.price) || 0;
    if (rate.rateType === "conditional") shippingFee = rate.freeAbove > 0 && subtotal >= rate.freeAbove ? 0 : Number(rate.belowPrice) || 0;
    if (rate.rateType === "weight") shippingFee = (Number(rate.basePrice) || 0) + trustedItems.reduce((sum, item) => sum + item.weightKg * item.quantity, 0) * (Number(rate.pricePerKg) || 0);
  }

  const total = Number((subtotal + shippingFee).toFixed(2));
  if (!Number.isFinite(total) || total <= 0) throw publicError("Order total must be greater than zero.");
  return { trustedItems, subtotal, shippingFee: Number(shippingFee.toFixed(2)), tax: 0, total, shippingMethod };
}

async function createPaymentAttempt({ items, customer, shippingAddress, shippingId, currency, idempotencyKey }) {
  assertCustomer(customer);
  if (typeof idempotencyKey !== "string" || idempotencyKey.length < 16 || idempotencyKey.length > 128) throw publicError("A valid idempotency key is required.");
  const existing = await PaymentAttempt.findOne({ idempotencyKey }).lean();
  if (existing) return { existing, accessToken: null };

  const calculation = await calculateTrustedCart(items, shippingId, shippingAddress?.country || "India");
  const money = convertFromINR(calculation.total, currency || "INR");
  const cartFingerprint = crypto.createHash("sha256").update(JSON.stringify({
    email: customer.email.trim().toLowerCase(),
    items: calculation.trustedItems.map((item) => ({ productId: item.productId, quantity: item.quantity, size: item.size })),
    shippingId: shippingId || "",
    currency: money.chargedCurrency,
  })).digest("hex");
  const activeAttempt = await PaymentAttempt.findOne({ cartFingerprint, status: { $in: ["created", "checkout_open", "pending", "authorized"] }, expiresAt: { $gt: new Date() } }).lean();
  if (activeAttempt) return { conflict: activeAttempt };
  let lock;
  try {
    lock = await PaymentAttemptLock.create({ fingerprint: cartFingerprint, expiresAt: new Date(Date.now() + ATTEMPT_TTL_MS) });
  } catch (error) {
    if (error?.code === 11000) {
      const existingLock = await PaymentAttemptLock.findOne({ fingerprint: cartFingerprint }).lean();
      const lockedAttempt = existingLock?.attemptId ? await PaymentAttempt.findById(existingLock.attemptId).lean() : null;
      if (lockedAttempt) return { conflict: lockedAttempt };
      return { conflict: { _id: null, status: "initializing" } };
    }
    throw error;
  }
  const accessToken = crypto.randomBytes(32).toString("hex");

  const order = await Order.create({
    items: calculation.trustedItems.map((item) => ({
      productId: item.productId,
      title: item.title,
      image: item.image,
      collection: item.collection,
      price: item.price,
      currency: "INR",
      qty: item.quantity,
      size: item.size,
    })),
    customer: { ...customer, email: customer.email.trim().toLowerCase() },
    shippingAddress,
    shippingMethod: calculation.shippingMethod,
    paymentMethod: "razorpay",
    subtotal: calculation.subtotal,
    shippingCost: calculation.shippingFee,
    tax: calculation.tax,
    total: calculation.total,
    currency: money.chargedCurrency,
    paymentStatus: "pending",
    status: "pending",
  });

  let attempt;
  try {
    attempt = await PaymentAttempt.create({
      localOrderId: order._id,
      accessTokenHash: hashToken(accessToken),
      customerEmail: customer.email,
      customerName: `${customer.firstName} ${customer.lastName || ""}`.trim(),
      items: calculation.trustedItems,
      subtotal: calculation.subtotal,
      shippingFee: calculation.shippingFee,
      tax: calculation.tax,
      total: calculation.total,
      ...money,
      shippingAddress,
      shippingMethod: calculation.shippingMethod,
      idempotencyKey,
      cartFingerprint,
      activeCartFingerprint: cartFingerprint,
      expiresAt: new Date(Date.now() + ATTEMPT_TTL_MS),
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: money.gatewayAmount,
      currency: money.chargedCurrency,
      receipt: `order_${order._id}`,
      notes: { localOrderId: String(order._id), paymentAttemptId: String(attempt._id) },
    });

    attempt.razorpayOrderId = razorpayOrder.id;
    attempt.status = "created";
    await attempt.save();
    order.razorpayOrderId = razorpayOrder.id;
    order.paymentDetails = { gateway: "razorpay", currency: money.chargedCurrency, amount: money.chargedAmount, razorpayOrderId: razorpayOrder.id };
    await order.save();
    await PaymentAttemptLock.findByIdAndUpdate(lock._id, { attemptId: attempt._id });
    return { attempt: await PaymentAttempt.findById(attempt._id).lean(), accessToken, razorpayOrder, order };
  } catch (error) {
    if (attempt) {
      await PaymentAttempt.findByIdAndUpdate(attempt._id, { status: "failed", $unset: { activeCartFingerprint: 1 }, failureReason: "Gateway order creation failed." });
    }
    if (lock) await PaymentAttemptLock.findByIdAndDelete(lock._id);
    if (error?.code === 11000 && error?.keyPattern?.activeCartFingerprint) {
      const activeAttempt = await PaymentAttempt.findOne({ activeCartFingerprint: cartFingerprint, expiresAt: { $gt: new Date() } }).lean();
      return { conflict: activeAttempt };
    }
    throw error;
  }
}

async function verifyPayment({ attemptId, accessToken, razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  if (!mongoose.isValidObjectId(attemptId) || !accessToken || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) throw publicError("Payment verification data is incomplete.");
  const attempt = await PaymentAttempt.findById(attemptId);
  if (!attempt || !safeEqual(attempt.accessTokenHash, hashToken(accessToken))) throw publicError("Payment attempt not found.", 404);
  if (attempt.razorpayOrderId !== razorpayOrderId) throw publicError("Payment order mismatch.");
  if (attempt.status === "captured") return { attempt: publicAttempt(attempt), order: await Order.findById(attempt.localOrderId).select("orderNumber status paymentStatus total currency paidAt").lean(), idempotent: true };
  if (attempt.expiresAt <= new Date()) throw publicError("Payment attempt has expired.");

  const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(`${razorpayOrderId}|${razorpayPaymentId}`).digest("hex");
  if (!safeEqual(expected, razorpaySignature)) throw publicError("Payment verification failed.");
  const payment = await razorpay.payments.fetch(razorpayPaymentId);
  if (!payment || payment.order_id !== attempt.razorpayOrderId || payment.amount !== attempt.gatewayAmount || payment.currency !== attempt.chargedCurrency) throw publicError("Payment details do not match the stored attempt.");
  if (!["authorized", "captured"].includes(payment.status)) throw publicError("Payment is not successful.");

  const reusedPayment = await PaymentAttempt.findOne({ razorpayPaymentId, _id: { $ne: attempt._id } }).lean();
  if (reusedPayment) {
    await PaymentAttempt.findByIdAndUpdate(attempt._id, { status: "duplicate", failureReason: "Razorpay payment ID was already linked to another attempt.", $unset: { activeCartFingerprint: 1 } });
    throw publicError("This payment has already been recorded and requires reconciliation.", 409);
  }

  attempt.razorpayPaymentId = razorpayPaymentId;
  attempt.razorpaySignature = razorpaySignature;
  attempt.status = payment.status === "captured" ? "captured" : "authorized";
  attempt.capturedAt = payment.status === "captured" ? new Date() : undefined;
  attempt.completedAt = payment.status === "captured" ? new Date() : undefined;
  if (payment.status === "captured") attempt.activeCartFingerprint = undefined;
  await attempt.save();
  if (payment.status === "captured") await PaymentAttemptLock.deleteOne({ fingerprint: attempt.cartFingerprint });
  if (payment.status !== "captured") return { attempt: publicAttempt(attempt), order: await Order.findById(attempt.localOrderId).select("orderNumber status paymentStatus total currency paidAt").lean(), pending: true };
  return finalizeCapturedAttempt(attempt);
}

async function finalizeCapturedAttempt(attempt) {
  const order = await Order.findByIdAndUpdate(
    { _id: attempt.localOrderId, paymentStatus: { $ne: "paid" } },
    {
      $set: { paymentStatus: "paid", status: "paid", razorpayPaymentId: attempt.razorpayPaymentId, paidAt: new Date(), successfulPaymentAttemptId: attempt._id, "paymentDetails.razorpayPaymentId": attempt.razorpayPaymentId },
    },
    { new: true }
  );
  if (!order) {
    const current = await Order.findById(attempt.localOrderId).lean();
    if (current?.paymentStatus === "paid" && String(current.successfulPaymentAttemptId) !== String(attempt._id)) {
      await PaymentAttempt.findByIdAndUpdate(attempt._id, { status: "duplicate", failureReason: "Second captured payment for an already-paid order." });
      return { attempt: publicAttempt(await PaymentAttempt.findById(attempt._id).lean()), order: current, duplicate: true };
    }
    return { attempt, order: current };
  }
  const marked = await Order.findOneAndUpdate({ _id: order._id, fulfilmentProcessed: false }, { $set: { fulfilmentProcessed: true } }, { new: true });
  if (marked) sendOrderConfirmationEmail(marked).catch((error) => console.error("Payment confirmation email failed:", error.message));
  return { attempt: publicAttempt(await PaymentAttempt.findById(attempt._id).lean()), order: marked || order };
}

async function processWebhook({ eventId, eventType, payload }) {
  if (!eventId) throw publicError("Webhook event ID is required.");
  const existing = await PaymentWebhookEvent.findOne({ eventId });
  if (existing) return { duplicate: true };
  const event = await PaymentWebhookEvent.create({ eventId, eventType, razorpayOrderId: payload?.payload?.payment?.entity?.order_id || "", razorpayPaymentId: payload?.payload?.payment?.entity?.id || "" });
  try {
    const payment = payload?.payload?.payment?.entity;
    if (!payment?.order_id || !payment?.id) {
      event.status = "ignored";
      await event.save();
      return { ignored: true };
    }
    const attempt = await PaymentAttempt.findOne({ razorpayOrderId: payment.order_id });
    if (!attempt) {
      event.status = "ignored";
      await event.save();
      return { ignored: true };
    }
    if (["payment.captured", "order.paid"].includes(eventType) && payment.status === "captured") {
      const reusedPayment = await PaymentAttempt.findOne({ razorpayPaymentId: payment.id, _id: { $ne: attempt._id } }).lean();
      if (reusedPayment) {
        attempt.status = "duplicate";
        attempt.failureReason = "Gateway payment ID was already linked to another attempt.";
        attempt.activeCartFingerprint = undefined;
        await attempt.save();
        await PaymentAttemptLock.deleteOne({ fingerprint: attempt.cartFingerprint });
        event.status = "processed";
        event.processedAt = new Date();
        await event.save();
        return { duplicate: true };
      }
      attempt.razorpayPaymentId = payment.id;
      attempt.status = "captured";
      attempt.capturedAt = attempt.capturedAt || new Date();
      attempt.activeCartFingerprint = undefined;
      await attempt.save();
      await PaymentAttemptLock.deleteOne({ fingerprint: attempt.cartFingerprint });
      const result = await finalizeCapturedAttempt(attempt);
      event.status = "processed";
      event.processedAt = new Date();
      await event.save();
      return result;
    }
    if (eventType === "payment.failed" && attempt.status !== "captured") {
      attempt.status = "failed";
      attempt.failureReason = "Gateway reported payment failure.";
      attempt.activeCartFingerprint = undefined;
      await attempt.save();
      await PaymentAttemptLock.deleteOne({ fingerprint: attempt.cartFingerprint });
    }
    event.status = "processed";
    event.processedAt = new Date();
    await event.save();
    return { processed: true };
  } catch (error) {
    event.status = "failed";
    event.error = error.message;
    await event.save();
    throw error;
  }
}

async function getPaymentStatus({ attemptId, accessToken }) {
  const attempt = await PaymentAttempt.findById(attemptId).lean();
  if (!attempt || !safeEqual(attempt.accessTokenHash, hashToken(accessToken))) throw publicError("Payment attempt not found.", 404);
  const order = await Order.findById(attempt.localOrderId).select("orderNumber status paymentStatus total currency paidAt").lean();
  return { attempt: publicAttempt(attempt), order };
}

async function cancelPaymentAttempt({ attemptId, accessToken, reason = "Checkout dismissed." }) {
  const attempt = await PaymentAttempt.findById(attemptId);
  if (!attempt || !safeEqual(attempt.accessTokenHash, hashToken(accessToken))) throw publicError("Payment attempt not found.", 404);
  if (["captured", "authorized"].includes(attempt.status)) return { attempt: publicAttempt(attempt.toObject()), unchanged: true };
  if (!["created", "checkout_open", "pending"].includes(attempt.status)) return { attempt: publicAttempt(attempt.toObject()), unchanged: true };
  attempt.status = "cancelled";
  attempt.cancellationReason = String(reason).slice(0, 250);
  attempt.activeCartFingerprint = undefined;
  await attempt.save();
  await PaymentAttemptLock.deleteOne({ fingerprint: attempt.cartFingerprint });
  return { attempt: publicAttempt(attempt.toObject()) };
}

async function refundPayment({ orderId, attemptId, amount, idempotencyKey }) {
  if (!mongoose.isValidObjectId(orderId) || !mongoose.isValidObjectId(attemptId)) throw publicError("Refund reference is invalid.");
  if (typeof idempotencyKey !== "string" || idempotencyKey.length < 16) throw publicError("A valid refund idempotency key is required.");
  const existing = await PaymentRefund.findOne({ idempotencyKey }).lean();
  if (existing) return { refund: existing, idempotent: true };
  const order = await Order.findById(orderId).lean();
  const attempt = await PaymentAttempt.findOne({ _id: attemptId, localOrderId: orderId, status: { $in: ["captured", "duplicate"] } }).lean();
  if (!order || !attempt || order.paymentStatus !== "paid" || !attempt.razorpayPaymentId) throw publicError("Only a captured payment can be refunded.");
  const refundAmount = Number(amount);
  const remaining = Number((attempt.chargedAmount - (order.refundedAmount || 0)).toFixed(attempt.currencyMinorUnit));
  if (!Number.isFinite(refundAmount) || refundAmount <= 0 || refundAmount > remaining) throw publicError("Refund amount exceeds the captured amount.");
  const record = await PaymentRefund.create({ localOrderId: order._id, paymentAttemptId: attempt._id, razorpayPaymentId: attempt.razorpayPaymentId, amount: refundAmount, currency: attempt.chargedCurrency, idempotencyKey });
  try {
    const gatewayRefund = await razorpay.payments.refund(attempt.razorpayPaymentId, { amount: Math.round(refundAmount * (10 ** attempt.currencyMinorUnit)), notes: { refundId: String(record._id) } });
    record.razorpayRefundId = gatewayRefund.id;
    record.status = "processed";
    await record.save();
    const refundedAmount = Number(((order.refundedAmount || 0) + refundAmount).toFixed(attempt.currencyMinorUnit));
    await Order.findOneAndUpdate({ _id: order._id, refundedAmount: order.refundedAmount || 0 }, { $set: { refundedAmount, refundStatus: refundedAmount >= attempt.chargedAmount ? "refunded" : "partially_refunded" } });
    return { refund: record.toObject() };
  } catch (error) {
    record.status = "failed";
    record.failureReason = "Gateway refund failed.";
    await record.save();
    throw publicError("Refund could not be completed.", 502);
  }
}

module.exports = { createPaymentAttempt, verifyPayment, processWebhook, getPaymentStatus, cancelPaymentAttempt, refundPayment, hashToken };
