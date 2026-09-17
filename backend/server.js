// Load the correct .env file based on NODE_ENV, from the backend folder regardless of cwd.
const path = require("path");
const env = process.env.NODE_ENV || "development";
const envSpecificPath = path.resolve(__dirname, `.env.${env}`);
const baseEnvPath = path.resolve(__dirname, ".env");

require("dotenv").config({ path: envSpecificPath });
require("dotenv").config({ path: baseEnvPath, override: false });

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const mongoose = require("mongoose");

const bookingRoutes   = require("./routes/booking");
const authRoutes      = require("./routes/auth");
const googleAuthRoutes = require("./routes/googleAuth");
const adminRoutes     = require("./routes/admin");
const productRoutes   = require("./routes/products");
const collectionRoutes = require("./routes/collections");
const orderRoutes     = require("./routes/orders");
const paymentRoutes   = require("./routes/payments");
const shippingRoutes  = require("./routes/shipping");
const shipmentRoutes  = require("./routes/shipment");
const trackRoutes     = require("./routes/track");
const notificationsRoutes = require("./routes/notifications");
const abandonedRoutes = require("./routes/abandonedCheckout");
const { startAbandonedCheckoutCron } = require("./cron/abandonedCheckoutCron");
const { startTrackingCron } = require("./cron/trackingCron");

const app = express();

app.disable("x-powered-by");
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());

// Build allowed origins list from env
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173,http://localhost:5174")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

console.log(`[${env.toUpperCase()}] Allowed origins:`, allowedOrigins);

app.use(cors({
  origin: (origin, cb) => {
    // Allow no-origin requests (Postman, curl, server-to-server)
    if (!origin) return cb(null, true);
    // Allow any localhost in development
    if (env === "development" && origin.startsWith("http://localhost:")) return cb(null, true);
    // Check explicit list
    if (allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use("/api/payments/webhook", express.raw({ type: "application/json", limit: "1mb" }));
app.use(express.json({ limit: "100kb", strict: true }));

app.use("/api/bookings",    bookingRoutes);
app.use("/api/auth",        authRoutes);
app.use("/api/auth",        googleAuthRoutes);
app.use("/api/admin",       adminRoutes);
app.use("/api/products",    productRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/orders",      orderRoutes);
app.use("/api/payments",    paymentRoutes);
app.use("/api/shipping",    shippingRoutes);
app.use("/api/shipment",    shipmentRoutes);
app.use("/api",             trackRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api",             abandonedRoutes);

app.get("/health", (_, res) => res.json({ status: "ok", env }));

function validateRuntimeSecrets() {
  const required = ["MONGODB_URI", "JWT_SECRET", "EMAIL_USER", "EMAIL_PASS"];
  if (env === "production") required.push("RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "RAZORPAY_WEBHOOK_SECRET");
  const missing = required.filter((name) => !String(process.env[name] || "").trim());
  if (missing.length) throw new Error(`Missing required runtime secrets: ${missing.join(", ")}`);
  if (String(process.env.JWT_SECRET).length < 32) throw new Error("JWT_SECRET must be at least 32 characters.");
}

async function startServer() {
  validateRuntimeSecrets();
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    family: 4,
  });
  console.log("MongoDB connected");
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} [${env}]`);
    startAbandonedCheckoutCron();
    startTrackingCron();
  });
}

if (require.main === module) {
  startServer().catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
}

module.exports = { app, startServer };
