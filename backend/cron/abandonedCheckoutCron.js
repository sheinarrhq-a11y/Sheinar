const cron = require("node-cron");
const mongoose = require("mongoose");
const AbandonedCheckout = require("../models/AbandonedCheckout");
const { sendAbandonedCheckoutReminder } = require("../utils/notifications");

function getReminderType(reminderCount) {
  if (reminderCount === 0) return "2_hour";
  if (reminderCount === 1) return "24_hour";
  if (reminderCount === 2) return "48_hour";
  if (reminderCount === 3) return "96_hour";
  return "repeat";
}

function shouldSendReminder(checkout) {
  if (!checkout.nextReminderAt) return true;
  return checkout.nextReminderAt <= new Date();
}

async function processRecord(checkout) {
  if (checkout.status !== "active" || checkout.orderCompleted) return;
  if (!shouldSendReminder(checkout)) return;
  if (checkout.expiresAt <= new Date()) {
    checkout.status = "expired";
    await checkout.save();
    return;
  }

  const type = getReminderType(checkout.reminderCount);
  const timestamp = new Date();
  const results = await sendAbandonedCheckoutReminder(checkout, type);

  const nextReminderAt = new Date(Date.now() + 96 * 60 * 60 * 1000);
  checkout.reminderCount += 1;
  checkout.lastReminderAt = timestamp;
  checkout.nextReminderAt = nextReminderAt;
  checkout.reminderHistory.push(...results.map((result) => ({
    channel: result.channel,
    reminderType: type,
    sentAt: timestamp,
    success: result.success,
    error: result.error,
  })));
  await checkout.save();
}

async function runAbandonedCheckoutCron() {
  const since = new Date();
  const records = await AbandonedCheckout.find({ status: "active", expiresAt: { $gt: since } })
    .where("nextReminderAt").lte(new Date())
    .limit(100);

  for (const record of records) {
    try {
      await processRecord(record);
    } catch (err) {
      console.error("Abandoned checkout cron entry failed:", err);
    }
  }
  return { processed: records.length };
}

function startAbandonedCheckoutCron() {
  cron.schedule("*/10 * * * *", async () => {
    try {
      if (mongoose.connection.readyState !== 1) {
        console.warn("Abandoned checkout cron skipped: MongoDB is not connected.");
        return;
      }
      await runAbandonedCheckoutCron();
    } catch (err) {
      console.error("Abandoned checkout cron failed:", err);
    }
  }, { scheduled: true, timezone: process.env.TIMEZONE || "UTC" });
}

module.exports = { startAbandonedCheckoutCron, runAbandonedCheckoutCron };
