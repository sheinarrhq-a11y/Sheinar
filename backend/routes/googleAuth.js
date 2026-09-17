const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Google token is required." });

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) return res.status(400).json({ error: "Invalid Google token." });

    const { sub: googleId, email, name, picture } = payload;
    if (!email || !name || !googleId) return res.status(400).json({ error: "Google token payload is missing required fields." });

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ googleId, email, name, avatar: picture });
      await user.save();
    } else {
      if (!user.googleId) user.googleId = googleId;
      if (!user.avatar && picture) user.avatar = picture;
      if (user.name !== name) user.name = name;
      await user.save();
    }

    const jwtToken = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token: jwtToken, user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, createdAt: user.createdAt } });
  } catch (error) {
    console.error("Google auth failed:", error);
    res.status(500).json({ error: "Google authentication failed." });
  }
});

module.exports = router;
