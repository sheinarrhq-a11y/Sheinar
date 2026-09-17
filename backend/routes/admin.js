const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const auth = require("../middleware/auth");

// GET /api/admin/bookings
router.get("/bookings", auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};
    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      Booking.countDocuments(filter),
    ]);
    res.json({ bookings, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

// PATCH /api/admin/bookings/:id
router.patch("/bookings/:id", auth, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!booking) return res.status(404).json({ error: "Not found." });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

// DELETE /api/admin/bookings/:id
router.delete("/bookings/:id", auth, async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

module.exports = router;
