const mongoose = require("mongoose");

const shippingRateSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true },
    scope:       { type: String, enum: ["domestic", "international", "both"], default: "both" },
    method:      { type: String, enum: ["standard", "express", "white-glove"], default: "standard" },
    rateType:    { type: String, enum: ["flat", "conditional", "weight", "free"], required: true },

    // flat
    price:       { type: Number, default: 0 },

    // conditional — free above threshold
    freeAbove:   { type: Number, default: 0 },
    belowPrice:  { type: Number, default: 0 },

    // weight-based
    pricePerKg:  { type: Number, default: 0 },
    basePrice:   { type: Number, default: 0 },

    eta:         { type: String, default: "" },
    active:      { type: Boolean, default: true },
    sortOrder:   { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ShippingRate", shippingRateSchema);
