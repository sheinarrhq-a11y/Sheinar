const mongoose = require("mongoose");

const paymentAttemptSchema = new mongoose.Schema(
  {
    localOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", index: true },
    accessTokenHash: { type: String, required: true, index: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true },
    customerName: { type: String, default: "", trim: true },
    items: [{
      productId: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
      size: { type: String, default: "" },
      title: { type: String, required: true },
      price: { type: Number, required: true, min: 0 },
      weightKg: { type: Number, default: 0.5, min: 0 },
    }],
    subtotal: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    baseCurrency: { type: String, required: true, uppercase: true },
    baseAmount: { type: Number, required: true, min: 0 },
    chargedCurrency: { type: String, required: true, uppercase: true },
    chargedAmount: { type: Number, required: true, min: 0 },
    gatewayAmount: { type: Number, required: true, min: 1 },
    currencyMinorUnit: { type: Number, required: true, min: 0, max: 4 },
    exchangeRate: { type: Number, required: true, min: 0 },
    exchangeRateSource: { type: String, required: true },
    exchangeRateTimestamp: { type: Date, required: true },
    shippingAddress: { type: mongoose.Schema.Types.Mixed, default: {} },
    shippingMethod: { type: String, default: "standard" },
    razorpayOrderId: { type: String, unique: true, sparse: true, index: true },
    razorpayPaymentId: { type: String, unique: true, sparse: true, index: true },
    razorpaySignature: { type: String, default: "" },
    idempotencyKey: { type: String, required: true, unique: true, index: true },
    cartFingerprint: { type: String, required: true, index: true },
    activeCartFingerprint: { type: String, unique: true, sparse: true, index: true },
    status: {
      type: String,
      enum: ["created", "checkout_open", "pending", "authorized", "captured", "failed", "cancelled", "expired", "superseded", "duplicate"],
      default: "created",
      index: true,
    },
    failureReason: { type: String, default: "" },
    cancellationReason: { type: String, default: "" },
    capturedAt: { type: Date },
    completedAt: { type: Date },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentAttempt", paymentAttemptSchema);
