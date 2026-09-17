const mongoose = require("mongoose");
const crypto = require("crypto");

const orderSchema = new mongoose.Schema(
  {
    items: [
      {
        productId: { type: String, required: true },
        title:     { type: String, required: true },
        image:     { type: String },
        collection:{ type: String },
        price:     { type: Number, required: true },
        currency:  { type: String, default: "INR" },
        qty:       { type: Number, required: true },
        size:      { type: String, default: "" },
      },
    ],
    customer: {
      email:     { type: String, required: true },
      firstName: { type: String, required: true },
      lastName:  { type: String },
      phone:     { type: String },
    },
    shippingAddress: {
      address: String,
      apt:     String,
      city:    String,
      state:   String,
      pin:     String,
      country: { type: String, default: "India" },
    },
    shippingMethod: { type: String, default: "standard" },
    paymentMethod:  { type: String, default: "cod" },
    paymentDetails: {
      gateway:          { type: String, enum: ["cod", "razorpay"], default: "cod" },
      currency:         { type: String, default: "INR" },
      amount:           { type: Number, default: 0 },
      razorpayOrderId:   { type: String, default: "" },
      razorpayPaymentId: { type: String, default: "" },
      razorpaySignature: { type: String, default: "" },
      metadata:         { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    subtotal:       { type: Number, required: true },
    shippingCost:   { type: Number, default: 0 },
    tax:            { type: Number, default: 0 },
    total:          { type: Number, required: true },
    carrier:        { type: String, enum: ["DHL", "Delhivery", "Blue Dart", "BlueDart", "FedEx", "DTDC", "Custom"], default: "Blue Dart" },
    logisticsProvider: { type: String, default: "" },
    trackingNumber: { type: String, unique: true, sparse: true },
    shipmentId:     { type: String, unique: true, sparse: true },
    estimatedDeliveryDate: { type: Date },
    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "processing",
        "shipment-created",
        "picked-up",
        "in-transit",
        "out-for-delivery",
        "delivered",
        "returned",
        "cancelled",
        "failed-delivery",
      ],
      default: "pending",
    },
    currency:          { type: String, default: "INR" },
    orderDate:         { type: Date },
    businessTimezone:  { type: String, default: "Asia/Kolkata" },
    razorpayOrderId:   { type: String, default: "" },
    razorpayPaymentId: { type: String, default: "" },
    paymentStatus:     { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    successfulPaymentAttemptId: { type: mongoose.Schema.Types.ObjectId, ref: "PaymentAttempt" },
    paidAt: { type: Date },
    fulfilmentProcessed: { type: Boolean, default: false },
    refundStatus: { type: String, enum: ["none", "pending", "partially_refunded", "refunded"], default: "none" },
    refundedAmount: { type: Number, default: 0, min: 0 },
    trackingHistory: [
      {
        status: { type: String, required: true },
        description: { type: String, default: "" },
        location: { type: String, default: "" },
        progressPercent: { type: Number, default: 0 },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    auditLogs: [
      {
        actor: { type: String, default: "system" },
        action: { type: String, required: true },
        notes: { type: String, default: "" },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    orderNumber: { type: String, unique: true },
  },
  { timestamps: true }
);

// Auto-generate order number before save
orderSchema.pre("save", async function () {
  if (!this.orderNumber) {
    this.orderNumber = `SH-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  }
});

module.exports = mongoose.model("Order", orderSchema);
