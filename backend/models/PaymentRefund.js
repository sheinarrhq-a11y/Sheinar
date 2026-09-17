const mongoose = require("mongoose");

const paymentRefundSchema = new mongoose.Schema(
  {
    localOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    paymentAttemptId: { type: mongoose.Schema.Types.ObjectId, ref: "PaymentAttempt", required: true, index: true },
    razorpayPaymentId: { type: String, required: true, index: true },
    razorpayRefundId: { type: String, unique: true, sparse: true },
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, required: true, uppercase: true },
    idempotencyKey: { type: String, required: true, unique: true, index: true },
    status: { type: String, enum: ["created", "processed", "failed"], default: "created", index: true },
    failureReason: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentRefund", paymentRefundSchema);
