const mongoose = require("mongoose");

const paymentAttemptLockSchema = new mongoose.Schema(
  {
    fingerprint: { type: String, required: true, unique: true, index: true },
    attemptId: { type: mongoose.Schema.Types.ObjectId, ref: "PaymentAttempt" },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentAttemptLock", paymentAttemptLockSchema);
