const jwt = require("jsonwebtoken");

module.exports = function customerAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Customer authentication required." });
  }

  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    if (!payload?.email) return res.status(403).json({ error: "Customer identity is required." });
    req.customer = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid customer token." });
  }
};