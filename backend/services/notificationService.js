const nodemailer = require("nodemailer");
const twilio = require("twilio");
const Notification = require("../models/Notification");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function isValidTwilioCredentials() {
  return (
    typeof process.env.TWILIO_ACCOUNT_SID === "string" &&
    process.env.TWILIO_ACCOUNT_SID.startsWith("AC") &&
    typeof process.env.TWILIO_AUTH_TOKEN === "string" &&
    process.env.TWILIO_AUTH_TOKEN.trim().length > 0
  );
}

if (process.env.TWILIO_ACCOUNT_SID && !process.env.TWILIO_ACCOUNT_SID.startsWith("AC")) {
  console.warn(
    "Invalid TWILIO_ACCOUNT_SID configured. It must start with 'AC'. Twilio notifications are disabled until valid credentials are provided."
  );
}

const twilioClient = isValidTwilioCredentials()
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

function formatCurrency(amount, currency = "INR") {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

async function sendEmail(to, subject, html) {
  const result = await transporter.sendMail({
    from: `"Sheinar   " <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
  return result;
}

async function sendSms(to, body) {
  if (!twilioClient) throw new Error("Twilio SMS is not configured.");
  return twilioClient.messages.create({
    from: process.env.TWILIO_SMS_FROM,
    to,
    body,
  });
}

async function sendWhatsApp(to, body) {
  if (!twilioClient) throw new Error("Twilio WhatsApp is not configured.");
  return twilioClient.messages.create({
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
    to: `whatsapp:${to}`,
    body,
  });
}

async function logNotification(data) {
  return Notification.create({
    ...data,
    status: data.status || "sent",
  });
}

function buildShipmentEmail(order, shipment, eventLabel) {
  const recipient = order.customer.firstName;
  return {
    subject: `Order ${order.orderNumber} — ${eventLabel}`,
    html: `
      <div style="font-family:Georgia,serif;color:#1a1a1a;padding:24px;max-width:600px;margin:0 auto;">
        <h1 style="font-size:22px;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">${eventLabel}</h1>
        <p style="font-size:14px;color:#444;line-height:1.8;">Hi ${recipient},</p>
        <p style="font-size:14px;color:#444;line-height:1.8;">
          Your shipment for order <strong>${order.orderNumber}</strong> is now <strong>${eventLabel.toLowerCase()}</strong>.
        </p>
        <p style="font-size:14px;color:#444;line-height:1.8;">Tracking number: <strong>${shipment.trackingNumber}</strong></p>
        <p style="font-size:14px;color:#444;line-height:1.8;">Carrier: <strong>${shipment.carrier}</strong></p>
        <p style="font-size:14px;color:#444;line-height:1.8;">Estimated delivery: <strong>${shipment.estimatedDeliveryDate ? new Date(shipment.estimatedDeliveryDate).toDateString() : "TBD"}</strong></p>
        <p style="font-size:14px;color:#444;line-height:1.8;">You can track your shipment at <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/track/${shipment.trackingNumber}">${process.env.FRONTEND_URL || "http://localhost:5173"}/track/${shipment.trackingNumber}</a>.</p>
      </div>
    `,
  };
}

function buildStatusSms(order, shipment, label) {
  return `Sheinar: Order ${order.orderNumber} is now ${label}. Tracking: ${shipment.trackingNumber}. Check ${process.env.FRONTEND_URL || "http://localhost:5173"}/track/${shipment.trackingNumber}`;
}

async function sendShipmentNotification(order, shipment, eventType) {
  const labelMap = {
    "shipment-created": "Shipment Created",
    cancelled: "Shipment Cancelled",
    delivered: "Delivered",
    "out-for-delivery": "Out For Delivery",
  };
  const label = labelMap[eventType] || eventType.replace(/-/g, " ");
  const emailData = buildShipmentEmail(order, shipment, label);

  try {
    await sendEmail(order.customer.email, emailData.subject, emailData.html);
    await logNotification({
      orderId: order._id,
      shipmentId: shipment._id,
      trackingNumber: shipment.trackingNumber,
      customerEmail: order.customer.email,
      channel: "email",
      type: eventType,
      subject: emailData.subject,
      message: emailData.html,
      status: "sent",
    });
  } catch (error) {
    await logNotification({
      orderId: order._id,
      shipmentId: shipment._id,
      trackingNumber: shipment.trackingNumber,
      customerEmail: order.customer.email,
      channel: "email",
      type: eventType,
      error: error.message,
      status: "failed",
    });
  }

  const smsBody = buildStatusSms(order, shipment, label);
  try {
    if (order.customer.phone) {
      await sendSms(order.customer.phone, smsBody);
      await logNotification({
        orderId: order._id,
        shipmentId: shipment._id,
        trackingNumber: shipment.trackingNumber,
        customerPhone: order.customer.phone,
        channel: "sms",
        type: eventType,
        message: smsBody,
        status: "sent",
      });
    }
  } catch (error) {
    await logNotification({
      orderId: order._id,
      shipmentId: shipment._id,
      trackingNumber: shipment.trackingNumber,
      customerPhone: order.customer.phone,
      channel: "sms",
      type: eventType,
      error: error.message,
      status: "failed",
    });
  }

  try {
    if (order.customer.phone) {
      await sendWhatsApp(order.customer.phone, smsBody);
      await logNotification({
        orderId: order._id,
        shipmentId: shipment._id,
        trackingNumber: shipment.trackingNumber,
        customerPhone: order.customer.phone,
        channel: "whatsapp",
        type: eventType,
        message: smsBody,
        status: "sent",
      });
    }
  } catch (error) {
    await logNotification({
      orderId: order._id,
      shipmentId: shipment._id,
      trackingNumber: shipment.trackingNumber,
      customerPhone: order.customer.phone,
      channel: "whatsapp",
      type: eventType,
      error: error.message,
      status: "failed",
    });
  }
}

async function sendTrackingUpdateNotifications(order, shipment, tracking) {
  if (["out-for-delivery", "delivered", "returned"].includes(tracking.currentStatus)) {
    await sendShipmentNotification(order, shipment, tracking.currentStatus);
  }
}

module.exports = {
  sendEmail,
  sendSms,
  sendWhatsApp,
  sendShipmentNotification,
  sendTrackingUpdateNotifications,
  logNotification,
};
