const mongoose = require("mongoose");

const paymentWebhookEventSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    eventType: { type: String, required: true },
    razorpayOrderId: { type: String, default: "", index: true },
    razorpayPaymentId: { type: String, default: "", index: true },
    status: { type: String, enum: ["received", "processed", "ignored", "failed"], default: "received" },
    error: { type: String, default: "" },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentWebhookEvent", paymentWebhookEventSchema);
