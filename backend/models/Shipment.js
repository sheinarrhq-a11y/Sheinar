const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    provider: { type: String, required: true },
    carrier: { type: String, required: true },
    shipmentId: { type: String, required: true, unique: true },
    trackingNumber: { type: String, required: true, unique: true },
    labelUrl: { type: String, default: "" },
    estimatedDeliveryDate: { type: Date },
    currentStatus: { type: String, default: "shipment-created" },
    currentLocation: { type: String, default: "Warehouse" },
    progressPercent: { type: Number, default: 0 },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    events: [
      {
        status: { type: String, required: true },
        detail: { type: String, default: "" },
        location: { type: String, default: "" },
        progress: { type: Number, default: 0 },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    isActive: { type: Boolean, default: true },
    cancelledAt: { type: Date },
    cancelledReason: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shipment", shipmentSchema);
