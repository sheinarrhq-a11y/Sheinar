const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { createShipmentForOrder, cancelShipment, trackShipment } = require("../services/shippingService");
const Order = require("../models/Order");

router.post("/create", auth, async (req, res) => {
  try {
    const { orderId, provider } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found." });

    const { order: updatedOrder, shipment } = await createShipmentForOrder(order, provider);
    res.json({ order: updatedOrder, shipment });
  } catch (err) {
    res.status(500).json({ error: err.message || "Shipment creation failed." });
  }
});

router.post("/cancel", auth, async (req, res) => {
  try {
    const { orderId, reason } = req.body;
    const { order, shipment, result } = await cancelShipment(orderId, { reason });
    res.json({ order, shipment, result });
  } catch (err) {
    res.status(500).json({ error: err.message || "Shipment cancellation failed." });
  }
});

router.get("/track/:trackingNumber", auth, async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const data = await trackShipment(trackingNumber);
    res.json(data);
  } catch (err) {
    res.status(404).json({ error: err.message || "Tracking not found." });
  }
});

module.exports = router;
