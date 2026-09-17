const express = require("express");
const router = express.Router();
const ShippingRate = require("../models/ShippingRate");
const auth = require("../middleware/auth");

// GET /api/shipping — public
router.get("/", async (req, res) => {
  try {
    const rates = await ShippingRate.find({ active: true }).sort({ sortOrder: 1, createdAt: 1 }).lean();
    res.json(rates);
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

// GET /api/shipping/all — admin (includes inactive)
router.get("/all", auth, async (req, res) => {
  try {
    const rates = await ShippingRate.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
    res.json(rates);
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

// POST /api/shipping
router.post("/", auth, async (req, res) => {
  try {
    const rate = await ShippingRate.create(req.body);
    res.status(201).json(rate);
  } catch (err) {
    res.status(500).json({ error: err.message || "Server error." });
  }
});

// PUT /api/shipping/:id
router.put("/:id", auth, async (req, res) => {
  try {
    const rate = await ShippingRate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!rate) return res.status(404).json({ error: "Not found." });
    res.json(rate);
  } catch (err) {
    res.status(500).json({ error: err.message || "Server error." });
  }
});

// DELETE /api/shipping/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    await ShippingRate.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

// POST /api/shipping/seed
router.post("/seed", auth, async (req, res) => {
  try {
    await ShippingRate.deleteMany({});
    await ShippingRate.insertMany([
      { name: "Free Shipping (India)",      scope: "domestic",      method: "standard",    rateType: "free",        price: 0,    eta: "5–7 business days",  sortOrder: 0 },
      { name: "Standard Domestic",          scope: "domestic",      method: "standard",    rateType: "conditional", belowPrice: 500,  freeAbove: 50000, eta: "3–5 business days",  sortOrder: 1 },
      { name: "Express Domestic",           scope: "domestic",      method: "express",     rateType: "flat",        price: 1500, eta: "1–2 business days",  sortOrder: 2 },
      { name: "White Glove Domestic",       scope: "domestic",      method: "white-glove", rateType: "flat",        price: 3500, eta: "Scheduled delivery", sortOrder: 3 },
      { name: "Standard International",     scope: "international", method: "standard",    rateType: "flat",        price: 2500, eta: "7–14 business days", sortOrder: 4 },
      { name: "Express International",      scope: "international", method: "express",     rateType: "flat",        price: 5000, eta: "3–5 business days",  sortOrder: 5 },
      { name: "Weight-Based International", scope: "international", method: "standard",    rateType: "weight",      basePrice: 1000, pricePerKg: 500, eta: "7–14 business days", sortOrder: 6 },
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
