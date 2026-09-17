const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const test = require("node:test");
const mongoose = require("mongoose");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const { MongoMemoryServer } = require("mongodb-memory-server");

process.env.NODE_ENV = "test";
process.env.RAZORPAY_KEY_ID = "rzp_test_key";
process.env.RAZORPAY_KEY_SECRET = "test_secret";
process.env.RAZORPAY_WEBHOOK_SECRET = "webhook_secret";
process.env.JWT_SECRET = "test_jwt_secret";
process.env.RAZORPAY_SUPPORTED_CURRENCIES = "INR,USD,EUR,JPY";
process.env.FX_RATES_JSON = JSON.stringify({ INR: 1, USD: 0.01, EUR: 0.01, JPY: 1.5 });

const gatewayState = { orders: [], payments: new Map() };
class FakeRazorpay {
  constructor() {
    this.orders = {
      create: async (payload) => {
        const order = { id: `order_${gatewayState.orders.length + 1}`, ...payload };
        gatewayState.orders.push(order);
        return order;
      },
    };
    this.payments = {
      fetch: async (paymentId) => gatewayState.payments.get(paymentId),
      refund: async (paymentId, payload) => ({ id: `rf_${paymentId}`, payment_id: paymentId, ...payload }),
    };
  }
}
require.cache[require.resolve("razorpay")] = { exports: FakeRazorpay };

const { app } = require("../server");
const Product = require("../models/Product");
const PaymentAttempt = require("../models/PaymentAttempt");
const Order = require("../models/Order");

let mongo;
let product;

function signature(orderId, paymentId) {
  return crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest("hex");
}

async function createAttempt(overrides = {}) {
  const idempotencyKey = overrides.idempotencyKey || crypto.randomUUID();
  return request(app)
    .post("/api/payments/create-order")
    .set("Idempotency-Key", idempotencyKey)
    .send({
      items: [{ productId: product.slug, quantity: 1, price: 1, title: "Tampered title" }],
      customer: { firstName: "Test", lastName: "Buyer", email: `buyer-${idempotencyKey.slice(0, 8)}@example.com` },
      shippingAddress: { country: "India", address: "Test Street", city: " Mohali", state: "CH", pin: "160001" },
      currency: overrides.currency || "INR",
      ...overrides,
    });
}

test.before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  product = await Product.create({
    title: "Trusted Dress",
    slug: "trusted-dress",
    price: 1000,
    currency: "INR",
    sku: "TRUST-1",
    status: "in-stock",
    description: "Test product",
  });
});

test.after(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

test("server recalculates price and ignores frontend price/title", async () => {
  const response = await createAttempt();
  assert.equal(response.status, 201);
  assert.equal(response.body.chargedCurrency, "INR");
  assert.equal(response.body.amount, 100000);
  assert.equal(response.body.chargedAmount, 1000);
  const attempt = await PaymentAttempt.findById(response.body.attemptId).lean();
  assert.equal(attempt.total, 1000);
  assert.equal(attempt.items[0].price, 1000);
  assert.equal(attempt.items[0].title, "Trusted Dress");
});

test("malicious quantities and missing carts are rejected", async () => {
  const zero = await createAttempt({ items: [{ productId: product.slug, quantity: 0 }] });
  const negative = await createAttempt({ items: [{ productId: product.slug, quantity: -1 }] });
  const missing = await createAttempt({ items: undefined });
  assert.equal(zero.status, 400);
  assert.equal(negative.status, 400);
  assert.equal(missing.status, 400);
});

test("unsupported currency is rejected and JPY uses zero minor units", async () => {
  const unsupported = await createAttempt({ currency: "CAD" });
  assert.equal(unsupported.status, 400);
  const jpy = await createAttempt({ currency: "JPY" });
  assert.equal(jpy.status, 201);
  assert.equal(jpy.body.amount, 1500);
});

test("verification rejects fake, cross-order, and mismatched gateway data", async () => {
  const created = await createAttempt();
  const fake = await request(app).post("/api/payments/verify").send({
    attemptId: created.body.attemptId,
    accessToken: created.body.accessToken,
    razorpayOrderId: created.body.razorpayOrderId,
    razorpayPaymentId: "pay_fake",
    razorpaySignature: "fake",
  });
  assert.equal(fake.status, 400);

  gatewayState.payments.set("pay_wrong_amount", {
    id: "pay_wrong_amount", order_id: created.body.razorpayOrderId, amount: 1, currency: "INR", status: "captured",
  });
  const mismatch = await request(app).post("/api/payments/verify").send({
    attemptId: created.body.attemptId,
    accessToken: created.body.accessToken,
    razorpayOrderId: created.body.razorpayOrderId,
    razorpayPaymentId: "pay_wrong_amount",
    razorpaySignature: signature(created.body.razorpayOrderId, "pay_wrong_amount"),
  });
  assert.equal(mismatch.status, 400);
});

test("valid verification is idempotent and duplicate verification does not create another order", async () => {
  const created = await createAttempt();
  const paymentId = "pay_valid";
  gatewayState.payments.set(paymentId, {
    id: paymentId, order_id: created.body.razorpayOrderId, amount: created.body.amount, currency: "INR", status: "captured",
  });
  const payload = {
    attemptId: created.body.attemptId,
    accessToken: created.body.accessToken,
    razorpayOrderId: created.body.razorpayOrderId,
    razorpayPaymentId: paymentId,
    razorpaySignature: signature(created.body.razorpayOrderId, paymentId),
  };
  const first = await request(app).post("/api/payments/verify").send(payload);
  const second = await request(app).post("/api/payments/verify").send(payload);
  assert.equal(first.status, 200);
  assert.equal(second.status, 200);
  assert.equal((await Order.countDocuments({ paymentStatus: "paid" })), 1);
  assert.equal(first.body.attempt.accessTokenHash, undefined);
  assert.equal(first.body.attempt.customerEmail, undefined);
});

test("webhook signature is checked and duplicate event IDs are idempotent", async () => {
  const created = await createAttempt();
  const body = JSON.stringify({ event: "payment.captured", payload: { payment: { entity: { id: "pay_webhook", order_id: created.body.razorpayOrderId, amount: created.body.amount, currency: "INR", status: "captured" } } } });
  const webhookSignature = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET).update(body).digest("hex");
  const invalid = await request(app).post("/api/payments/webhook").set("X-Razorpay-Signature", "bad").set("X-Razorpay-Event-Id", "evt_bad").send(body);
  assert.equal(invalid.status, 400);
  const valid = await request(app).post("/api/payments/webhook").set("Content-Type", "application/json").set("X-Razorpay-Signature", webhookSignature).set("X-Razorpay-Event-Id", "evt_1").send(body);
  const duplicate = await request(app).post("/api/payments/webhook").set("Content-Type", "application/json").set("X-Razorpay-Signature", webhookSignature).set("X-Razorpay-Event-Id", "evt_1").send(body);
  assert.equal(valid.status, 200);
  assert.equal(duplicate.status, 200);
  assert.equal(duplicate.body.duplicate, true);
});

test("different tabs cannot create a second active attempt for the same cart", async () => {
  const email = "multi-tab@example.com";
  const first = await createAttempt({ customer: { firstName: "Multi", lastName: "Tab", email } });
  const second = await createAttempt({ customer: { firstName: "Multi", lastName: "Tab", email } });
  assert.equal(first.status, 201);
  assert.equal(second.status, 409);
  assert.equal(second.body.attemptId, first.body.attemptId);
});

test("cancelled attempts can be retried but cannot cancel a captured attempt", async () => {
  const cancelled = await createAttempt();
  const cancelResponse = await request(app).post("/api/payments/cancel").set("X-Payment-Access-Token", cancelled.body.accessToken).send({ attemptId: cancelled.body.attemptId });
  assert.equal(cancelResponse.status, 200);
  assert.equal(cancelResponse.body.attempt.status, "cancelled");

  const retry = await createAttempt();
  const paymentId = "pay_cancel-race";
  gatewayState.payments.set(paymentId, { id: paymentId, order_id: retry.body.razorpayOrderId, amount: retry.body.amount, currency: "INR", status: "captured" });
  const verified = await request(app).post("/api/payments/verify").send({
    attemptId: retry.body.attemptId,
    accessToken: retry.body.accessToken,
    razorpayOrderId: retry.body.razorpayOrderId,
    razorpayPaymentId: paymentId,
    razorpaySignature: signature(retry.body.razorpayOrderId, paymentId),
  });
  const lateCancel = await request(app).post("/api/payments/cancel").set("X-Payment-Access-Token", retry.body.accessToken).send({ attemptId: retry.body.attemptId });
  assert.equal(verified.status, 200);
  assert.equal(lateCancel.body.unchanged, true);
});

test("concurrent create requests allow one active attempt and return conflict for the other", async () => {
  const body = {
    items: [{ productId: product.slug, quantity: 1 }],
    customer: { firstName: "Race", lastName: "Buyer", email: "race@example.com" },
    shippingAddress: { country: "India", address: "Race Street", city: " Mohali", state: "CH", pin: "160001" },
    currency: "INR",
  };
  const [first, second] = await Promise.all([
    request(app).post("/api/payments/create-order").set("Idempotency-Key", crypto.randomUUID()).send(body),
    request(app).post("/api/payments/create-order").set("Idempotency-Key", crypto.randomUUID()).send(body),
  ]);
  assert.deepEqual([first.status, second.status].sort(), [201, 409], JSON.stringify({ first: first.body, second: second.body }));
});

test("a reused payment ID is rejected and marked duplicate", async () => {
  const first = await createAttempt({ customer: { firstName: "First", lastName: "Buyer", email: "first-payment@example.com" } });
  const firstPaymentId = "pay_reused";
  gatewayState.payments.set(firstPaymentId, { id: firstPaymentId, order_id: first.body.razorpayOrderId, amount: first.body.amount, currency: "INR", status: "captured" });
  const firstVerification = await request(app).post("/api/payments/verify").send({ attemptId: first.body.attemptId, accessToken: first.body.accessToken, razorpayOrderId: first.body.razorpayOrderId, razorpayPaymentId: firstPaymentId, razorpaySignature: signature(first.body.razorpayOrderId, firstPaymentId) });
  assert.equal(firstVerification.status, 200);

  const second = await createAttempt({ customer: { firstName: "Second", lastName: "Buyer", email: "second-payment@example.com" } });
  gatewayState.payments.set(firstPaymentId, { id: firstPaymentId, order_id: second.body.razorpayOrderId, amount: second.body.amount, currency: "INR", status: "captured" });
  const secondVerification = await request(app).post("/api/payments/verify").send({ attemptId: second.body.attemptId, accessToken: second.body.accessToken, razorpayOrderId: second.body.razorpayOrderId, razorpayPaymentId: firstPaymentId, razorpaySignature: signature(second.body.razorpayOrderId, firstPaymentId) });
  assert.equal(secondVerification.status, 409);
  assert.equal((await PaymentAttempt.findById(second.body.attemptId)).status, "duplicate");
});

test("refund endpoint requires admin authorization", async () => {
  const response = await request(app).post("/api/payments/refund").send({});
  assert.equal(response.status, 401);
});

test("malformed JSON and oversized JSON are rejected", async () => {
  const malformed = await request(app).post("/api/payments/verify").set("Content-Type", "application/json").send("{broken");
  assert.equal(malformed.status, 400);
  const oversized = await request(app).post("/api/payments/verify").set("Content-Type", "application/json").send(JSON.stringify({ value: "x".repeat(120000) }));
  assert.equal(oversized.status, 413);
});

test("expired attempts and wrong session tokens cannot be used", async () => {
  const created = await createAttempt();
  await PaymentAttempt.findByIdAndUpdate(created.body.attemptId, { expiresAt: new Date(Date.now() - 1000) });
  const expired = await request(app).post("/api/payments/verify").send({
    attemptId: created.body.attemptId,
    accessToken: created.body.accessToken,
    razorpayOrderId: created.body.razorpayOrderId,
    razorpayPaymentId: "pay_expired",
    razorpaySignature: signature(created.body.razorpayOrderId, "pay_expired"),
  });
  const wrongStatus = await request(app).get(`/api/payments/status/${created.body.attemptId}`).set("X-Payment-Access-Token", "wrong-token");
  assert.equal(expired.status, 400);
  assert.equal(wrongStatus.status, 404);
});

test("a failed webhook cannot downgrade a captured payment", async () => {
  const created = await createAttempt();
  const paymentId = "pay_captured_then_failed";
  gatewayState.payments.set(paymentId, { id: paymentId, order_id: created.body.razorpayOrderId, amount: created.body.amount, currency: "INR", status: "captured" });
  const verified = await request(app).post("/api/payments/verify").send({
    attemptId: created.body.attemptId,
    accessToken: created.body.accessToken,
    razorpayOrderId: created.body.razorpayOrderId,
    razorpayPaymentId: paymentId,
    razorpaySignature: signature(created.body.razorpayOrderId, paymentId),
  });
  assert.equal(verified.status, 200);
  const body = JSON.stringify({ event: "payment.failed", payload: { payment: { entity: { id: paymentId, order_id: created.body.razorpayOrderId, status: "failed" } } } });
  const webhookSignature = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET).update(body).digest("hex");
  const failedWebhook = await request(app).post("/api/payments/webhook").set("Content-Type", "application/json").set("X-Razorpay-Signature", webhookSignature).set("X-Razorpay-Event-Id", "evt_failed_after_capture").send(body);
  assert.equal(failedWebhook.status, 200);
  assert.equal((await PaymentAttempt.findById(created.body.attemptId)).status, "captured");
  assert.equal((await Order.findById(verified.body.order._id)).paymentStatus, "paid");
});

test("refund endpoint rejects amounts above the captured amount", async () => {
  const created = await createAttempt();
  const paymentId = "pay_refund_limit";
  gatewayState.payments.set(paymentId, { id: paymentId, order_id: created.body.razorpayOrderId, amount: created.body.amount, currency: "INR", status: "captured" });
  const verified = await request(app).post("/api/payments/verify").send({
    attemptId: created.body.attemptId,
    accessToken: created.body.accessToken,
    razorpayOrderId: created.body.razorpayOrderId,
    razorpayPaymentId: paymentId,
    razorpaySignature: signature(created.body.razorpayOrderId, paymentId),
  });
  assert.equal(verified.status, 200);
  const adminToken = jwt.sign({ id: "test-admin", role: "admin" }, process.env.JWT_SECRET);
  const overRefund = await request(app).post("/api/payments/refund")
    .set("Authorization", `Bearer ${adminToken}`)
    .set("Idempotency-Key", crypto.randomUUID())
    .send({ orderId: verified.body.order._id, attemptId: created.body.attemptId, amount: 1001 });
  assert.equal(overRefund.status, 400);
  assert.equal((await Order.findById(verified.body.order._id)).refundedAmount || 0, 0);
});
