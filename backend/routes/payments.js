const express = require("express");
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const { supportedCurrencies } = require("../services/currencyService");
const auth = require("../middleware/auth");
const { createPaymentAttempt, verifyPayment, processWebhook, getPaymentStatus, cancelPaymentAttempt, refundPayment } = require("../services/paymentService");

const router = express.Router();
const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: process.env.NODE_ENV === "test" ? 1000 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many payment requests. Please try again shortly." },
});

function sendError(res, error) {
  const status = Number.isInteger(error.status) ? error.status : 500;
  res.status(status).json({ error: status === 500 ? "Payment service is temporarily unavailable." : error.message });
}

function paymentConflictDetails(conflict) {
  if (conflict.status === "initializing") {
    return { message: "A payment attempt for this cart is being initialized. Please retry in a few seconds." };
  }

  const retryAfterSeconds = Math.max(0, Math.ceil((new Date(conflict.expiresAt).getTime() - Date.now()) / 1000));
  return {
    message: "A payment attempt for this cart is already in progress. Please wait up to 10 minutes until the current payment attempt expires before starting a new one.",
    retryAfterSeconds,
    expiresAt: conflict.expiresAt,
  };
}

router.get("/currencies", (_, res) => {
  res.json({ currencies: [...supportedCurrencies()] });
});

router.post("/create-order", paymentLimiter, async (req, res) => {
  try {
    const idempotencyKey = req.get("Idempotency-Key") || req.body.idempotencyKey;
    const result = await createPaymentAttempt({ ...req.body, idempotencyKey });
    if (result.conflict) {
      const conflict = paymentConflictDetails(result.conflict);
      return res.status(409).json({ error: conflict.message, attemptId: result.conflict._id || undefined, status: result.conflict.status, retryAfterSeconds: conflict.retryAfterSeconds, expiresAt: conflict.expiresAt });
    }
    if (result.existing) return res.status(409).json({ error: "This idempotency key was already used. Recover the existing payment session or start a new attempt." , attemptId: result.existing._id, status: result.existing.status });
    res.status(201).json({
      attemptId: result.attempt._id,
      accessToken: result.accessToken,
      razorpayOrderId: result.razorpayOrder.id,
      amount: result.razorpayOrder.amount,
      currency: result.razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      chargedAmount: result.attempt.chargedAmount,
      chargedCurrency: result.attempt.chargedCurrency,
      expiresAt: result.attempt.expiresAt,
    });
  } catch (error) {
    sendError(res, error);
  }
});

router.post("/verify", paymentLimiter, async (req, res) => {
  try {
    const result = await verifyPayment(req.body);
    res.json({ success: true, status: result.pending ? "pending" : result.duplicate ? "duplicate" : result.order?.paymentStatus || "paid", ...result });
  } catch (error) {
    sendError(res, error);
  }
});

router.get("/status/:attemptId", paymentLimiter, async (req, res) => {
  try {
    const result = await getPaymentStatus({ attemptId: req.params.attemptId, accessToken: req.get("X-Payment-Access-Token") || req.query.token });
    res.json(result);
  } catch (error) {
    sendError(res, error);
  }
});

router.post("/cancel", paymentLimiter, async (req, res) => {
  try {
    const result = await cancelPaymentAttempt({ attemptId: req.body.attemptId, accessToken: req.get("X-Payment-Access-Token") || req.body.accessToken, reason: req.body.reason });
    res.json({ success: true, ...result });
  } catch (error) {
    sendError(res, error);
  }
});

router.post("/refund", auth, paymentLimiter, async (req, res) => {
  try {
    const result = await refundPayment({ ...req.body, idempotencyKey: req.get("Idempotency-Key") || req.body.idempotencyKey });
    res.json({ success: true, ...result });
  } catch (error) {
    sendError(res, error);
  }
});

router.post("/webhook", async (req, res) => {
  try {
    const signature = req.get("X-Razorpay-Signature");
    const eventId = req.get("X-Razorpay-Event-Id");
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from("");
    if (!signature || !eventId || !process.env.RAZORPAY_WEBHOOK_SECRET || rawBody.length === 0) return res.status(400).json({ error: "Invalid webhook." });
    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest("hex");
    const left = Buffer.from(signature);
    const right = Buffer.from(expected);
    if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) return res.status(400).json({ error: "Invalid webhook signature." });
    const payload = JSON.parse(rawBody.toString("utf8"));
    const result = await processWebhook({ eventId, eventType: payload.event, payload });
    res.json({ success: true, ...result });
  } catch (error) {
    sendError(res, error);
  }
});

module.exports = router;
