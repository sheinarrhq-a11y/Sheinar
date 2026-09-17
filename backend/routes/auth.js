const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const Admin = require("../models/Admin");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please try again later." },
});

// POST /api/auth/login
router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "Username and password required." });

    const admin = await Admin.findOne({ username });
    if (!admin || !(await admin.comparePassword(password)))
      return res.status(401).json({ error: "Invalid credentials." });

    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: "4h" }  // 4-hour session
    );

    // Prevent caching of auth responses
    res.set("Cache-Control", "no-store");
    res.json({ token, username: admin.username });
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

module.exports = router;
