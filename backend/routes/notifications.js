const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { sendEmail, sendSms, sendWhatsApp, logNotification } = require("../services/notificationService");

router.post("/send", auth, async (req, res) => {
  try {
    const { channel, to, subject, html, body, orderId, shipmentId, trackingNumber } = req.body;
    if (!channel || !to) return res.status(400).json({ error: "Channel and recipient are required." });

    let result;
    if (channel === "email") {
      if (!subject || !html) return res.status(400).json({ error: "Email subject and html body are required." });
      result = await sendEmail(to, subject, html);
    } else if (channel === "sms") {
      if (!body) return res.status(400).json({ error: "SMS body is required." });
      result = await sendSms(to, body);
    } else if (channel === "whatsapp") {
      if (!body) return res.status(400).json({ error: "WhatsApp body is required." });
      result = await sendWhatsApp(to, body);
    } else {
      return res.status(400).json({ error: "Unsupported channel." });
    }

    await logNotification({
      orderId,
      shipmentId,
      trackingNumber,
      customerEmail: channel === "email" ? to : undefined,
      customerPhone: channel !== "email" ? to : undefined,
      channel,
      type: "manual",
      subject: subject || "",
      message: html || body || "",
      status: "sent",
    });

    res.json({ success: true, result });
  } catch (err) {
    await logNotification({
      orderId: req.body.orderId,
      shipmentId: req.body.shipmentId,
      trackingNumber: req.body.trackingNumber,
      customerEmail: req.body.channel === "email" ? req.body.to : undefined,
      customerPhone: req.body.channel !== "email" ? req.body.to : undefined,
      channel: req.body.channel,
      type: "manual",
      subject: req.body.subject || "",
      message: req.body.html || req.body.body || "",
      error: err.message,
      status: "failed",
    });
    res.status(500).json({ error: err.message || "Notification failed." });
  }
});

module.exports = router;
