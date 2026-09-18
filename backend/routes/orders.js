const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Razorpay = require("razorpay");
const Order = require("../models/Order");
const auth = require("../middleware/auth");
const customerAuth = require("../middleware/customerAuth");
const rateLimit = require("express-rate-limit");
const { sendOrderConfirmationEmail, sendOrderStatusEmail } = require("../utils/email");

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const VALID_PAYMENT_METHODS = new Set(["cod", "razorpay"]);
const customerOrderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many order history requests. Please try again later." },
});

function roundCents(value) {
  return Math.round(value * 100) / 100;
}

function validateItems(items) {
  return Array.isArray(items) && items.length > 0 && items.every((item) => 
    item && typeof item.productId === "string" && typeof item.title === "string" &&
    typeof item.price === "number" && item.price >= 0 &&
    typeof item.qty === "number" && Number.isInteger(item.qty) && item.qty > 0
  );
}

function calculateSubtotal(items) {
  return roundCents(items.reduce((sum, item) => sum + item.price * item.qty, 0));
}

function calculateTotal(subtotal, shippingCost, tax) {
  return roundCents(subtotal + roundCents(shippingCost) + roundCents(tax));
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ── Currency conversion rates (base: INR) ────────────────
// Update these periodically or swap with a live-rates API
const FX = {
  INR: 1,
  USD: 0.012,
  GBP: 0.0095,
  EUR: 0.011,
  AED: 0.044,
  CAD: 0.016,
  AUD: 0.018,
  SGD: 0.016,
  SAR: 0.045,
  JPY: 1.82,
};

function toINR(amount, currency) {
  const rate = FX[currency] || 1;
  return Math.round(amount / rate);
}

// POST /api/orders/create-razorpay-order
// Creates a Razorpay order and returns order_id + key to frontend
router.post("/create-razorpay-order", async (req, res) => {
  return res.status(410).json({ error: "Use /api/payments/create-order." });
  /* istanbul ignore next -- retained below only while clients migrate */
  try {
    const { totalINR, currency = "INR", receipt } = req.body;
    if (!Number.isFinite(Number(totalINR)) || Number(totalINR) <= 0)
      return res.status(400).json({ error: "A valid order total is required." });
    // Razorpay always works in smallest unit (paise for INR)
    const amountPaise = Math.round(Number(totalINR) * 100);

    const rzpOrder = await razorpay.orders.create({
      amount:   amountPaise,
      currency: "INR", // Razorpay India account settles in INR
      receipt:  receipt || `rcpt_${Date.now()}`,
    });

    res.json({
      razorpayOrderId: rzpOrder.id,
      amount:          rzpOrder.amount,
      currency:        rzpOrder.currency,
      keyId:           process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Razorpay order creation failed." });
  }
});

// POST /api/orders — save order after payment
router.post("/", async (req, res) => {
  return res.status(410).json({ error: "Use /api/payments/create-order and /api/payments/verify." });
  /* istanbul ignore next -- retained below only while clients migrate */
  try {
    const {
      items, customer, shippingAddress, shippingMethod, paymentMethod,
      subtotal, shippingCost, tax, total, currency,
      razorpayOrderId, razorpayPaymentId, razorpaySignature,
    } = req.body;

    if (!validateItems(items))
      return res.status(400).json({ error: "Invalid cart items." });
    if (!customer?.email || !customer?.firstName)
      return res.status(400).json({ error: "Customer info required." });
    if (!VALID_PAYMENT_METHODS.has(paymentMethod))
      return res.status(400).json({ error: "Invalid payment method." });

    const expectedSubtotal = calculateSubtotal(items);
    if (roundCents(subtotal) !== expectedSubtotal)
      return res.status(400).json({ error: "Cart subtotal does not match item totals." });

    if (shippingCost < 0 || tax < 0)
      return res.status(400).json({ error: "Invalid shipping or tax amount." });

    const expectedTotal = calculateTotal(expectedSubtotal, shippingCost, tax);
    if (roundCents(total) !== expectedTotal)
      return res.status(400).json({ error: "Order total does not match calculated amount." });

    let paymentStatus = "pending";
    const paymentDetails = {
      gateway: paymentMethod === "cod" ? "cod" : "razorpay",
      currency: currency || "INR",
      amount: expectedTotal,
      razorpayOrderId:   razorpayOrderId   || "",
      razorpayPaymentId: razorpayPaymentId || "",
      razorpaySignature: razorpaySignature || "",
    };

    if (paymentMethod !== "cod") {
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature)
        return res.status(400).json({ error: "Payment details are required for online payment." });

      const razorpayOrder = await razorpay.orders.fetch(razorpayOrderId);
      if (!razorpayOrder || razorpayOrder.currency !== "INR" || razorpayOrder.amount !== Math.round(expectedTotal * 100))
        return res.status(400).json({ error: "Payment amount does not match the order total." });

      const existingOrder = await Order.findOne({ "paymentDetails.razorpayPaymentId": razorpayPaymentId }).lean();
      if (existingOrder) {
        return res.status(200).json({ success: true, orderNumber: existingOrder.orderNumber, orderId: existingOrder._id, message: "Payment already recorded." });
      }

      const body = `${razorpayOrderId}|${razorpayPaymentId}`;
      const expected = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

      if (expected !== razorpaySignature)
        return res.status(400).json({ error: "Payment verification failed." });

      paymentStatus = "paid";
    }

    const order = await Order.create({
      items,
      customer,
      shippingAddress,
      shippingMethod,
      paymentMethod,
      subtotal: expectedSubtotal,
      shippingCost,
      tax,
      total: expectedTotal,
      currency: currency || "INR",
      paymentDetails,
      paymentStatus,
      status: paymentStatus === "paid" ? "paid" : "pending",
    });

    // Send confirmation email (non-blocking)
    sendOrderConfirmationEmail(order).catch((e) => console.error("Order email failed:", e.message));

    res.status(201).json({
      success: true,
      orderNumber: order.orderNumber,
      orderId: order._id,
      message: "Order created. Select logistics provider from admin panel to create shipment.",
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Server error." });
  }
});

// GET /api/orders — all orders (admin) with optional filters + pagination
router.get("/", auth, async (req, res) => {
  try {
    const { status, carrier, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (carrier) filter.carrier = carrier;
    if (search) {
      filter.$or = [
        { orderNumber: search },
        { trackingNumber: search },
        { "customer.email": search },
        { "customer.phone": search },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Order.countDocuments(filter),
    ]);
    res.json({ orders, total, pages: Math.ceil(total / Number(limit)), page: Number(page) });
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

// GET /api/orders/customer?email=... — storefront account order history
router.get("/customer", customerAuth, customerOrderLimiter, async (req, res) => {
  try {
    const email = String(req.query.email || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ error: "Email is required." });
    if (email !== String(req.customer.email).trim().toLowerCase()) return res.status(403).json({ error: "You may only access your own orders." });
    const orders = await Order.find({
      "customer.email": { $regex: new RegExp(`^${escapeRegex(email)}$`, "i") },
    }).sort({ createdAt: -1 }).lean();
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: "Unable to load orders." });
  }
});

// GET /api/orders/:id (admin)
router.get("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).json({ error: "Not found." });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

// PATCH /api/orders/:id/status (admin)
router.patch("/:id/status", auth, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id, { status: req.body.status }, { new: true }
    );
    if (!order) return res.status(404).json({ error: "Not found." });

    // Send status update email (non-blocking)
    sendOrderStatusEmail(order).catch((e) => console.error("Status email failed:", e.message));

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

module.exports = router;
