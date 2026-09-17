const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Shipment = require("../models/Shipment");

router.get("/track/:trackingNumber", async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const shipment = await Shipment.findOne({ trackingNumber }).lean();
    if (!shipment) return res.status(404).json({ error: "Tracking number not found." });
    const order = await Order.findById(shipment.orderId).lean();
    res.json({ order, shipment });
  } catch (err) {
    res.status(500).json({ error: err.message || "Server error." });
  }
});

router.get("/order-status/:orderNumber", async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const order = await Order.findOne({ orderNumber }).lean();
    if (!order) return res.status(404).json({ error: "Order not found." });
    const shipment = order.trackingNumber ? await Shipment.findOne({ trackingNumber: order.trackingNumber }).lean() : null;
    res.json({ order, shipment });
  } catch (err) {
    res.status(500).json({ error: err.message || "Server error." });
  }
});

router.get("/search", async (req, res) => {
  try {
    const { email, orderNumber, trackingNumber } = req.query;
    const filter = {};
    if (orderNumber) filter.orderNumber = orderNumber;
    if (trackingNumber) filter.trackingNumber = trackingNumber;
    if (email && orderNumber) filter["customer.email"] = email;
    if (Object.keys(filter).length === 0) return res.status(400).json({ error: "Provide search terms." });

    const order = await Order.findOne(filter).lean();
    if (!order) return res.status(404).json({ error: "Order not found." });

    const shipment = order.trackingNumber ? await Shipment.findOne({ trackingNumber: order.trackingNumber }).lean() : null;
    res.json({ order, shipment });
  } catch (err) {
    res.status(500).json({ error: err.message || "Server error." });
  }
});

module.exports = router;
