const nodemailer = require("nodemailer");
const twilio = require("twilio");

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
    "Invalid TWILIO_ACCOUNT_SID configured. It must start with 'AC'. Twilio reminders are disabled until valid credentials are provided."
  );
}

const twilioClient = isValidTwilioCredentials()
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const FROM_EMAIL = process.env.EMAIL_USER;
const FROM_NAME = process.env.ABANDONED_EMAIL_FROM_NAME || "Sheinar   ";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const COUPON_CODE = process.env.ABANDONED_CART_COUPON_CODE || "SHEINAR10";

function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

function buildItemsHtml(items) {
  return items.map((item) => `
    <tr>
      <td style="padding:16px 0;border-bottom:1px solid #eee;vertical-align:top;width:80px;">
        ${item.image ? `<img src="${item.image}" width="68" height="84" style="object-fit:cover;border-radius:8px;" />` : ""}
      </td>
      <td style="padding:16px 0;border-bottom:1px solid #eee;vertical-align:top;">
        <p style="margin:0;font-size:14px;color:#1a1a1a;font-family:Georgia,serif;">${item.title}</p>
        <p style="margin:6px 0 0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">${item.collection || ""}</p>
        ${item.size ? `<p style="margin:6px 0 0;font-size:12px;color:#666;">Size: ${item.size}</p>` : ""}
        <p style="margin:4px 0 0;font-size:12px;color:#666;">Qty ${item.qty}</p>
      </td>
      <td style="padding:16px 0;border-bottom:1px solid #eee;vertical-align:top;text-align:right;font-size:14px;color:#1a1a1a;">${formatINR(item.price * item.qty)}</td>
    </tr>
  `).join("");
}

function getReminderCopy(type, checkout) {
  const name = checkout.customerName || "there";
  const url = checkout.recoveryLink;
  const item = checkout.cartItems[0];
  const firstProduct = item ? `${item.title}${item.qty > 1 ? ` + ${checkout.cartItems.length - 1} more` : ""}` : "your cart";

  switch (type) {
    case "2_hour":
      return {
        subject: `Still waiting for your Sheinar order, ${name}`,
        headline: `Your cart is reserved for a short time`,
        message: `Hi ${name}, we noticed you were close to completing your order. ${firstProduct} is still waiting in your cart.`,
        button: `Return to Checkout`,
        whatsapp: `Hi ${name}, your Sheinar cart is waiting. Complete checkout while your favorites are still available: ${url}`,
        sms: `Hi ${name}, your Sheinar cart is ready. Finish checkout: ${url}`,
      };
    case "24_hour":
      return {
        subject: `A gentle reminder from Sheinar — your cart is still waiting`,
        headline: `Items are on hold, but not forever`,
        message: `Hi ${name}, your selected pieces are still available. Checkout now before they move to another   .`,
        button: `Complete Your Order`,
        whatsapp: `Hi ${name}, this is a friendly reminder from Sheinar. Your cart is still active: ${url}`,
        sms: `Your Sheinar cart is still waiting. Complete it here: ${url}`,
      };
    case "48_hour":
      return {
        subject: `An exclusive offer from Sheinar — revisit your cart`,
        headline: `A small luxury token just for you`,
        message: `Hi ${name}, we’d love to welcome you back with an exclusive code. Use ${COUPON_CODE} while checkout is still open.`,
        button: `Redeem Your Cart`,
        whatsapp: `Hi ${name}, your Sheinar cart is still waiting. Use ${COUPON_CODE} on checkout and complete your order: ${url}`,
        sms: `Hi ${name}, your Sheinar cart is waiting. Apply ${COUPON_CODE} at checkout: ${url}`,
      };
    case "96_hour":
      return {
        subject: `Final reminder from Sheinar — your cart expires soon`,
        headline: `Last chance to restore your order`,
        message: `Hi ${name}, this is our final reminder. Your selected pieces have been reserved a little longer, but they may soon be released.`,
        button: `Restore Your Cart`,
        whatsapp: `Hi ${name}, final reminder from Sheinar. Restore your cart before it expires: ${url}`,
        sms: `Final Sheinar reminder: restore your cart now before it is released: ${url}`,
      };
    default:
      return {
        subject: `Your Sheinar cart is still waiting`,
        headline: `A thoughtful reminder from Sheinar`,
        message: `Hi ${name}, we are still holding your cart. Return to complete your order when you are ready.`,
        button: `Complete Checkout`,
        whatsapp: `Hi ${name}, your Sheinar cart can still be completed here: ${url}`,
        sms: `Your Sheinar cart is still active. Complete it now: ${url}`,
      };
  }
}

function buildAbandonedEmailHtml(checkout, type) {
  const copy = getReminderCopy(type, checkout);
  const itemsHtml = buildItemsHtml(checkout.cartItems);
  return `
    <div style="max-width:680px;margin:0 auto;font-family:Georgia,serif;color:#1a1a1a;background:#f7f4f1;padding:40px 24px;">
      <div style="text-align:center;margin-bottom:32px;">
        <p style="font-size:12px;letter-spacing:4px;text-transform:uppercase;color:#b08d57;margin:0;">Sheinar   </p>
        <h1 style="font-size:32px;margin:12px 0 0;letter-spacing:4px;text-transform:uppercase;color:#1a1a1a;">Luxury rediscovered</h1>
      </div>
      <div style="background:#fff;border:1px solid #e8e2dc;border-radius:28px;overflow:hidden;">
        <div style="padding:40px 36px;">
          <p style="margin:0;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#888;">${copy.subject}</p>
          <h2 style="margin:18px 0 16px;font-size:28px;color:#1a1a1a;line-height:1.1;">${copy.headline}</h2>
          <p style="margin:0 0 28px;font-size:15px;color:#555;line-height:1.9;">${copy.message}</p>
          <div style="text-align:center;margin-bottom:32px;">
            <a href="${checkout.recoveryLink}" style="display:inline-block;padding:16px 28px;background:#b08d57;color:#fff;text-decoration:none;text-transform:uppercase;letter-spacing:2px;font-size:12px;border-radius:999px;">${copy.button}</a>
          </div>
        </div>
        <div style="background:#f6f0e8;padding:28px 36px;border-top:1px solid #e7dfd5;">
          <h3 style="margin:0 0 22px;font-size:14px;text-transform:uppercase;letter-spacing:2px;color:#888;">Your selected pieces</h3>
          <table style="width:100%;border-collapse:collapse;">${itemsHtml}</table>
          <div style="margin-top:26px;padding-top:22px;border-top:1px solid #e7dfd5;font-size:14px;color:#1a1a1a;display:flex;justify-content:space-between;">
            <span>Total</span>
            <strong>${formatINR(checkout.totalAmount)}</strong>
          </div>
        </div>
      </div>
      <p style="margin:32px 0 0;font-size:12px;line-height:1.8;color:#777;text-align:center;">If you have completed your order already, simply ignore this note.</p>
    </div>
  `;
}

async function retryAction(action, label) {
  let lastError = null;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      return await action();
    } catch (error) {
      lastError = error;
      console.error(`Notification attempt ${attempt} failed for ${label}:`, error?.message || error);
      if (attempt === 2) throw error;
    }
  }
  throw lastError;
}

async function sendAbandonedCartEmail(checkout, reminderType) {
  if (!FROM_EMAIL) throw new Error("EMAIL_USER is not configured.");
  const html = buildAbandonedEmailHtml(checkout, reminderType);
  const copy = getReminderCopy(reminderType, checkout);
  await retryAction(() => transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to: checkout.email,
    subject: copy.subject,
    html,
  }), `abandoned-email:${checkout.email}`);
}

async function sendWhatsAppReminder(checkout, reminderType) {
  if (!twilioClient || !process.env.TWILIO_WHATSAPP_FROM) {
    throw new Error("Twilio WhatsApp configuration is missing.");
  }
  const copy = getReminderCopy(reminderType, checkout);
  return retryAction(() => twilioClient.messages.create({
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
    to: `whatsapp:${checkout.phone}`,
    body: copy.whatsapp,
  }), `whatsapp:${checkout.phone}`);
}

async function sendSmsNotification(checkout, reminderType) {
  if (!twilioClient || !process.env.TWILIO_SMS_FROM) {
    throw new Error("Twilio SMS configuration is missing.");
  }
  const copy = getReminderCopy(reminderType, checkout);
  return retryAction(() => twilioClient.messages.create({
    from: process.env.TWILIO_SMS_FROM,
    to: checkout.phone,
    body: copy.sms,
  }), `sms:${checkout.phone}`);
}

async function sendAbandonedCheckoutReminder(checkout, reminderType) {
  const results = [];
  const channels = ["email", "whatsapp", "sms"];
  for (const channel of channels) {
    try {
      if (channel === "email") await sendAbandonedCartEmail(checkout, reminderType);
      if (channel === "whatsapp") await sendWhatsAppReminder(checkout, reminderType);
      if (channel === "sms") await sendSmsNotification(checkout, reminderType);
      results.push({ channel, reminderType, success: true, error: "" });
    } catch (error) {
      results.push({ channel, reminderType, success: false, error: error?.message || String(error) });
    }
  }
  if (ADMIN_EMAIL && FROM_EMAIL) {
    const copy = getReminderCopy(reminderType, checkout);
    const details = `Reminder ${reminderType} for ${checkout.email} — status: ${checkout.status}`;
    await transporter.sendMail({
      from: `"${FROM_NAME} Notifications" <${FROM_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject: `Abandoned cart reminder sent: ${checkout.email}`,
      html: `<div style="font-family:Georgia,serif;color:#1a1a1a;"><h2>${details}</h2><p>${copy.message}</p><p>Recovery URL: <a href="${checkout.recoveryLink}">${checkout.recoveryLink}</a></p></div>`,
    }).catch((err) => console.error("Admin notification send failed:", err));
  }
  return results;
}

module.exports = { sendAbandonedCheckoutReminder, FRONTEND_URL };
