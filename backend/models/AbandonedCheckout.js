const mongoose = require("mongoose");

const abandonedCheckoutSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phone: { type: String, required: true, trim: true, index: true },
    shippingAddress: {
      address: { type: String, required: true, trim: true },
      apt: { type: String, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      pin: { type: String, required: true, trim: true },
      country: { type: String, default: "India", trim: true },
    },
    cartItems: [
      {
        productId: { type: String, required: true },
        title: { type: String, required: true, trim: true },
        image: { type: String, trim: true },
        collection: { type: String, trim: true },
        price: { type: Number, required: true, min: 0 },
        currency: { type: String, default: "INR", trim: true },
        qty: { type: Number, required: true, min: 1 },
        size: { type: String, default: "", trim: true },
      },
    ],
    totalAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR", trim: true },
    checkoutStartedAt: { type: Date, required: true, default: Date.now },
    status: { type: String, enum: ["active", "completed", "expired"], default: "active" },
    orderCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
    recoveryToken: { type: String, required: true, unique: true },
    recoveryLink: { type: String, required: true },
    reminderCount: { type: Number, default: 0 },
    nextReminderAt: { type: Date },
    lastReminderAt: { type: Date },
    expiresAt: { type: Date, required: true },
    reminderHistory: [
      {
        channel: { type: String, enum: ["email", "whatsapp", "sms"], required: true },
        reminderType: { type: String, required: true },
        sentAt: { type: Date, required: true, default: Date.now },
        success: { type: Boolean, required: true, default: false },
        error: { type: String, trim: true, default: "" },
      },
    ],
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

abandonedCheckoutSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("AbandonedCheckout", abandonedCheckoutSchema);
