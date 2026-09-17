const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    shipmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Shipment" },
    trackingNumber: { type: String },
    customerEmail: { type: String },
    customerPhone: { type: String },
    channel: { type: String, required: true, enum: ["email", "sms", "whatsapp"] },
    type: { type: String, required: true },
    subject: { type: String, default: "" },
    message: { type: String, default: "" },
    status: { type: String, required: true, enum: ["pending", "sent", "failed"] , default: "pending"},
    error: { type: String, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
