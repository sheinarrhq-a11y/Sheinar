const mongoose = require("mongoose");

const trackingEventSchema = new mongoose.Schema(
  {
    shipmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Shipment", required: true, index: true },
    trackingNumber: { type: String, required: true, index: true },
    status: { type: String, required: true },
    detail: { type: String, required: true },
    location: { type: String, default: "" },
    progress: { type: Number, default: 0 },
    provider: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TrackingEvent", trackingEventSchema);
