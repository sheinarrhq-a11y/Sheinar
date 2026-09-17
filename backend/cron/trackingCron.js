const cron = require("node-cron");
const mongoose = require("mongoose");
const { refreshActiveShipments } = require("../services/shippingService");

function startTrackingCron() {
  cron.schedule("*/30 * * * *", async () => {
    try {
      if (mongoose.connection.readyState !== 1) {
        console.warn("Tracking cron skipped: MongoDB is not connected.");
        return;
      }
      const updates = await refreshActiveShipments();
      if (updates.length > 0) {
        console.log(`Tracking cron updated ${updates.length} active shipments.`);
      }
    } catch (err) {
      console.error("Tracking cron failed:", err.message || err);
    }
  }, { scheduled: true, timezone: process.env.TIMEZONE || "UTC" });
}

module.exports = { startTrackingCron };
