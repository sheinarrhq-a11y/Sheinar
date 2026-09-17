const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const { sendBookingEmails } = require("../utils/email");
const rateLimit = require("express-rate-limit");

const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many booking requests. Please try again later." },
});

// POST /api/bookings
router.post("/", bookingLimiter, async (req, res) => {
  try {
    const { name, email, phone, store, date, time, message } = req.body;

    if (!name || !email || !store || !date || !time) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const booking = await Booking.create({ name, email, phone, store, date, time, message });

    // Send emails (non-blocking — don't fail the request if email fails)
    sendBookingEmails(booking).catch((err) =>
      console.error("Email send error:", err.message)
    );

    res.status(201).json({ success: true, bookingId: booking._id });
  } catch (err) {
    console.error("Booking error:", err.message);
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

module.exports = router;
