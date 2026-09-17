const express = require("express");
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const AbandonedCheckout = require("../models/AbandonedCheckout");
const { sendAbandonedCheckoutReminder, FRONTEND_URL } = require("../utils/notifications");
const auth = require("../middleware/auth");

const router = express.Router();

const checkoutLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many checkout requests. Please try again in a moment." },
});

const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});

function isValidEmail(value) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value) {
  return typeof value === "string" && /^\+?[0-9]{7,16}$/.test(value.replace(/[^0-9]/g, ""));
}

function validateItems(items) {
  return Array.isArray(items) && items.length > 0 && items.every((item) => {
    return item && typeof item.productId === "string" && typeof item.title === "string" &&
      typeof item.price === "number" && item.price >= 0 &&
      typeof item.qty === "number" && Number.isInteger(item.qty) && item.qty > 0;
  });
}

function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function buildRecoveryLink(token) {
  return `${FRONTEND_URL.replace(/\/$/, "")}/checkout?recovery=${token}`;
}

router.post("/checkout/save", checkoutLimiter, async (req, res) => {
  try {
    const { email, phone, firstName, lastName, shippingAddress, cartItems, totalAmount, currency = "INR" } = req.body;
    const customerName = `${firstName?.trim() || ""} ${lastName?.trim() || ""}`.trim();

    if (!isValidEmail(email)) return res.status(400).json({ error: "A valid email is required." });
    if (!isValidPhone(phone)) return res.status(400).json({ error: "A valid phone number is required." });
    if (!customerName) return res.status(400).json({ error: "Customer name is required." });
    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pin || !shippingAddress.country)
      return res.status(400).json({ error: "Complete shipping information is required." });
    if (!validateItems(cartItems)) return res.status(400).json({ error: "Invalid cart items." });

    const computedTotal = calculateTotal(cartItems);
    if (typeof totalAmount !== "number" || Math.abs(computedTotal - totalAmount) > 0.01)
      return res.status(400).json({ error: "Total amount does not match cart items." });

    const now = new Date();
    let checkout = null;

    if (req.body.recoveryToken) {
      checkout = await AbandonedCheckout.findOne({ recoveryToken: req.body.recoveryToken });
    }

    if (!checkout) {
      checkout = await AbandonedCheckout.findOne({ email, phone, status: "active" });
    }

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const nextReminderAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

    if (!checkout || checkout.status !== "active") {
      const recoveryToken = crypto.randomBytes(20).toString("hex");
      const recoveryLink = buildRecoveryLink(recoveryToken);
      checkout = await AbandonedCheckout.create({
        customerName,
        email,
        phone,
        shippingAddress,
        cartItems,
        totalAmount: computedTotal,
        currency,
        checkoutStartedAt: now,
        recoveryToken,
        recoveryLink,
        nextReminderAt,
        expiresAt,
      });
    } else {
      checkout.customerName = customerName;
      checkout.shippingAddress = shippingAddress;
      checkout.cartItems = cartItems;
      checkout.totalAmount = computedTotal;
      checkout.currency = currency;
      checkout.expiresAt = expiresAt;
      if (!checkout.nextReminderAt || checkout.reminderCount === 0) checkout.nextReminderAt = nextReminderAt;
      checkout.lastUpdatedAt = now;
      checkout.status = "active";
      checkout.orderCompleted = false;
      await checkout.save();
    }

    res.json({
      success: true,
      recoveryToken: checkout.recoveryToken,
      recoveryLink: checkout.recoveryLink,
      checkoutId: checkout._id,
    });
  } catch (error) {
    console.error("Checkout save failed:", error);
    res.status(500).json({ error: "Unable to save checkout. Please try again." });
  }
});

router.get("/checkout/restore", checkoutLimiter, async (req, res) => {
  try {
    const recoveryToken = String(req.query.token || req.query.recovery || "").trim();
    if (!recoveryToken) return res.status(400).json({ error: "Recovery token is required." });

    const checkout = await AbandonedCheckout.findOne({ recoveryToken, status: "active", expiresAt: { $gt: new Date() } }).lean();
    if (!checkout) return res.status(404).json({ error: "Abandoned checkout not found or expired." });

    res.json({
      success: true,
      checkout: {
        customerName: checkout.customerName,
        firstName: checkout.customerName.split(" ")[0] || "",
        lastName: checkout.customerName.split(" ").slice(1).join(" "),
        email: checkout.email,
        phone: checkout.phone,
        shippingAddress: checkout.shippingAddress,
        cartItems: checkout.cartItems,
        totalAmount: checkout.totalAmount,
        currency: checkout.currency,
        recoveryToken: checkout.recoveryToken,
        recoveryLink: checkout.recoveryLink,
      },
    });
  } catch (error) {
    console.error("Restore checkout failed:", error);
    res.status(500).json({ error: "Unable to restore checkout." });
  }
});

router.post("/checkout/complete", checkoutLimiter, async (req, res) => {
  try {
    const { recoveryToken } = req.body;
    if (!recoveryToken) return res.status(400).json({ error: "Recovery token is required." });

    const checkout = await AbandonedCheckout.findOne({ recoveryToken, status: "active" });
    if (!checkout) return res.status(404).json({ error: "Checkout record not found." });

    checkout.status = "completed";
    checkout.orderCompleted = true;
    checkout.completedAt = new Date();
    checkout.nextReminderAt = null;
    await checkout.save();

    res.json({ success: true });
  } catch (error) {
    console.error("Complete checkout failed:", error);
    res.status(500).json({ error: "Unable to mark checkout completed." });
  }
});

router.post("/checkout/webhook", checkoutLimiter, async (req, res) => {
  try {
    const { type, recoveryToken, status } = req.body;
    if (!recoveryToken || !type) return res.status(400).json({ error: "Webhook payload invalid." });

    const checkout = await AbandonedCheckout.findOne({ recoveryToken });
    if (!checkout) return res.status(404).json({ error: "Checkout record not found." });

    if (type === "checkout.completed" || type === "payment.completed" || status === "paid") {
      checkout.status = "completed";
      checkout.orderCompleted = true;
      checkout.completedAt = new Date();
      checkout.nextReminderAt = null;
      await checkout.save();
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Checkout webhook failure:", error);
    res.status(500).json({ error: "Webhook processing failed." });
  }
});

router.get("/abandoned-cart", auth, adminLimiter, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status && ["active", "completed", "expired"].includes(String(status))) filter.status = String(status);

    const pageNumber = Math.max(1, Number(page));
    const pageSize = Math.min(100, Number(limit) || 20);
    const skip = (pageNumber - 1) * pageSize;

    const [items, total] = await Promise.all([
      AbandonedCheckout.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(pageSize).lean(),
      AbandonedCheckout.countDocuments(filter),
    ]);

    res.json({ success: true, items, total, page: pageNumber, pages: Math.ceil(total / pageSize) });
  } catch (error) {
    console.error("Fetch abandoned carts failed:", error);
    res.status(500).json({ error: "Unable to load abandoned carts." });
  }
});

router.get("/abandoned-cart/stats", auth, adminLimiter, async (req, res) => {
  try {
    const now = new Date();
    const [activeCount, completedCount, expiredCount, reminderSummary] = await Promise.all([
      AbandonedCheckout.countDocuments({ status: "active" }),
      AbandonedCheckout.countDocuments({ status: "completed" }),
      AbandonedCheckout.countDocuments({ status: "expired" }),
      AbandonedCheckout.aggregate([
        { $unwind: "$reminderHistory" },
        { $group: { _id: "$reminderHistory.channel", total: { $sum: 1 }, success: { $sum: { $cond: ["$reminderHistory.success", 1, 0] } } } },
      ]),
    ]);

    const recovered = completedCount;
    const totalTracked = activeCount + completedCount + expiredCount;
    res.json({
      success: true,
      activeCount,
      completedCount,
      expiredCount,
      totalTracked,
      recoveryRate: totalTracked === 0 ? 0 : Number(((recovered / totalTracked) * 100).toFixed(1)),
      reminderSummary,
      staleCount: await AbandonedCheckout.countDocuments({ status: "active", expiresAt: { $lte: now } }),
    });
  } catch (error) {
    console.error("Fetch abandoned cart stats failed:", error);
    res.status(500).json({ error: "Unable to load abandoned cart stats." });
  }
});

router.delete("/abandoned-cart/cleanup", auth, adminLimiter, async (req, res) => {
  try {
    const threshold = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await AbandonedCheckout.deleteMany({ updatedAt: { $lte: threshold } });
    res.json({ success: true, deleted: result.deletedCount });
  } catch (error) {
    console.error("Cleanup abandoned carts failed:", error);
    res.status(500).json({ error: "Unable to cleanup abandoned carts." });
  }
});

module.exports = router;
