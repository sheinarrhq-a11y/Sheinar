const nodemailer = require("nodemailer");
const Notification = require("../models/Notification");

const transporter = nodemailer.createTransport({
  ...(process.env.EMAIL_HOST
    ? {
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT || 587),
        secure: String(process.env.EMAIL_SECURE).toLowerCase() === "true",
      }
    : { service: "gmail" }),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendWithRetry(message, label) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await transporter.sendMail(message);
    } catch (error) {
      lastError = error;
      console.error(`Email attempt ${attempt} failed for ${label}:`, error?.message || error);
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }
  throw lastError;
}

async function logOrderEmail({ order, recipient, subject, status, error = "" }) {
  try {
    await Notification.create({
      orderId: order._id,
      customerEmail: recipient,
      channel: "email",
      type: "order-confirmation",
      subject,
      status,
      error,
      metadata: { orderNumber: order.orderNumber },
    });
  } catch (logError) {
    console.error("Could not log order email notification:", logError.message);
  }
}

// ── Shared styles ─────────────────────────────────────────
const BASE = `max-width:600px;margin:0 auto;font-family:Georgia,serif;color:#1a1a1a;padding:40px 20px;background:#fff;`;
const HR   = `<hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0;" />`;

function header() {
  return `
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="font-size:24px;font-weight:normal;letter-spacing:6px;text-transform:uppercase;margin:0;">SHEINAR</h1>
      <p style="color:#b08d57;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:4px 0 0;">Couture · Est. Heritage</p>
    </div>
    ${HR}
  `;
}

function footer() {
  return `
    ${HR}
    <p style="font-size:11px;color:#aaa;text-align:center;line-height:1.8;">
      Sheinar   ,  Mohali, India<br/>
      <a href="mailto:sheinarrhq@gmail.com" style="color:#b08d57;text-decoration:none;">sheinarrhq@gmail.com</a> &nbsp;·&nbsp; +917719490036
    </p>
  `;
}

function formatINR(n) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
}

// ── Status badge colours ──────────────────────────────────
const STATUS_COLORS = {
  pending:    { bg: "#fff8e1", text: "#b08d57", label: "Order Received" },
  confirmed:  { bg: "#e8f5e9", text: "#2e7d32", label: "Order Confirmed" },
  processing: { bg: "#e3f2fd", text: "#1565c0", label: "Being Prepared" },
  shipped:    { bg: "#f3e5f5", text: "#6a1b9a", label: "Shipped" },
  delivered:  { bg: "#e8f5e9", text: "#1b5e20", label: "Delivered" },
  cancelled:  { bg: "#ffebee", text: "#c62828", label: "Cancelled" },
};

const STATUS_MESSAGES = {
  pending:    "We have received your order and will begin processing it shortly.",
  confirmed:  "Your order has been confirmed by our   . We will begin crafting your piece soon.",
  processing: "Your order is currently being prepared with care by our artisans.",
  shipped:    "Your order is on its way. You will receive a tracking number shortly.",
  delivered:  "Your order has been delivered. We hope you love your Sheinar piece.",
  cancelled:  "Your order has been cancelled. If you have any questions, please contact us.",
};

// ── Order Confirmation Email ──────────────────────────────
async function sendOrderConfirmationEmail(order) {
  const { customer, items, orderNumber, subtotal, shippingCost, tax, total, shippingAddress, shippingMethod } = order;

  const itemsHtml = items.map((item) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="width:64px;vertical-align:top;">
              ${item.image ? `<img src="${item.image}" width="60" height="72" style="object-fit:cover;display:block;" />` : ""}
            </td>
            <td style="padding-left:12px;vertical-align:top;">
              <p style="margin:0;font-size:14px;color:#1a1a1a;">${item.title}</p>
              <p style="margin:4px 0 0;font-size:11px;color:#888;letter-spacing:1px;text-transform:uppercase;">${item.collection || ""}</p>
              ${item.size ? `<p style="margin:4px 0 0;font-size:11px;color:#888;">Size: ${item.size}</p>` : ""}
              <p style="margin:4px 0 0;font-size:12px;color:#888;">Qty: ${item.qty}</p>
            </td>
            <td style="text-align:right;vertical-align:top;font-size:14px;color:#1a1a1a;">${formatINR(item.price * item.qty)}</td>
          </tr>
        </table>
      </td>
    </tr>
  `).join("");

  const addr = shippingAddress;
  const addressHtml = addr
    ? `${addr.address}${addr.apt ? ", " + addr.apt : ""}, ${addr.city}, ${addr.state} ${addr.pin}, ${addr.country}`
    : "—";

  const html = `
    <div style="${BASE}">
      ${header()}
      <h2 style="font-size:20px;font-weight:normal;margin:0 0 8px;">Thank you, ${customer.firstName}.</h2>
      <p style="font-size:14px;color:#555;line-height:1.8;margin:0 0 24px;">
        Your order has been placed. Our    will reach out within 24 hours with your order details and timeline.
      </p>

      <div style="background:#faf9f7;border:1px solid #e5e5e5;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#888;">Order Number</p>
        <p style="margin:6px 0 0;font-size:18px;color:#b08d57;letter-spacing:2px;">${orderNumber}</p>
      </div>

      ${HR}
      <h3 style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#888;margin-bottom:12px;">Your Items</h3>
      <table style="width:100%;border-collapse:collapse;">${itemsHtml}</table>

      ${HR}
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <tr><td style="padding:5px 0;color:#888;">Subtotal</td><td style="text-align:right;">${formatINR(subtotal)}</td></tr>
        <tr><td style="padding:5px 0;color:#888;">Shipping (${shippingMethod || "Standard"})</td><td style="text-align:right;">${shippingCost === 0 ? "Free" : formatINR(shippingCost)}</td></tr>
        <tr><td style="padding:5px 0;color:#888;">GST (5%)</td><td style="text-align:right;">${formatINR(tax)}</td></tr>
        <tr style="border-top:1px solid #e5e5e5;">
          <td style="padding:10px 0 5px;font-size:15px;font-weight:bold;">Total</td>
          <td style="text-align:right;font-size:15px;font-weight:bold;">${formatINR(total)}</td>
        </tr>
      </table>

      ${HR}
      <h3 style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#888;margin-bottom:8px;">Shipping To</h3>
      <p style="font-size:13px;color:#444;line-height:1.8;margin:0;">${customer.firstName} ${customer.lastName || ""}<br/>${addressHtml}</p>

      ${footer()}
    </div>
  `;

  const customerSubject = `Order Confirmed · ${orderNumber} — Sheinar`;
  const adminSubject = `New Order · ${orderNumber} — ${customer.firstName} ${customer.lastName || ""}`;
  const adminHtml = `
      <div style="${BASE}">
        ${header()}
        <h2 style="font-size:18px;font-weight:normal;">New Order Received</h2>
        <p style="font-size:13px;color:#555;">Order <strong>${orderNumber}</strong> from <strong>${customer.firstName} ${customer.lastName || ""}</strong> (${customer.email})</p>
        <p style="font-size:13px;color:#555;">Total: <strong>${formatINR(total)}</strong> · Items: ${items.length}</p>
        ${HR}
        <table style="width:100%;border-collapse:collapse;">${itemsHtml}</table>
        ${footer()}
      </div>
    `;

  const messages = [
    { recipient: customer.email, subject: customerSubject, html, label: `order-customer:${orderNumber}` },
    { recipient: process.env.ADMIN_EMAIL, subject: adminSubject, html: adminHtml, label: `order-admin:${orderNumber}` },
  ];
  const failures = [];
  for (const message of messages) {
    if (!message.recipient) continue;
    try {
      await sendWithRetry({ from: `"Sheinar Orders" <${process.env.EMAIL_USER}>`, to: message.recipient, subject: message.subject, html: message.html }, message.label);
      await logOrderEmail({ order, recipient: message.recipient, subject: message.subject, status: "sent" });
    } catch (error) {
      const errorMessage = error?.message || String(error);
      failures.push(errorMessage);
      await logOrderEmail({ order, recipient: message.recipient, subject: message.subject, status: "failed", error: errorMessage });
    }
  }
  if (failures.length) throw new Error(`Order email delivery failed: ${failures.join("; ")}`);
}

// ── Order Status Update Email ─────────────────────────────
async function sendOrderStatusEmail(order) {
  const { customer, orderNumber, status } = order;
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending;
  const msg = STATUS_MESSAGES[status] || "";

  const html = `
    <div style="${BASE}">
      ${header()}
      <h2 style="font-size:20px;font-weight:normal;margin:0 0 8px;">Order Update, ${customer.firstName}.</h2>
      <p style="font-size:14px;color:#555;line-height:1.8;margin:0 0 24px;">Your Sheinar order status has been updated.</p>

      <div style="background:#faf9f7;border:1px solid #e5e5e5;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#888;">Order Number</p>
        <p style="margin:6px 0 0;font-size:18px;color:#b08d57;letter-spacing:2px;">${orderNumber}</p>
      </div>

      <div style="text-align:center;margin:32px 0;">
        <span style="display:inline-block;background:${s.bg};color:${s.text};font-size:13px;letter-spacing:2px;text-transform:uppercase;padding:10px 28px;border-radius:2px;">
          ${s.label}
        </span>
      </div>

      <p style="font-size:14px;color:#555;line-height:1.8;text-align:center;">${msg}</p>

      ${footer()}
    </div>
  `;

  await transporter.sendMail({
    from: `"Sheinar   " <${process.env.EMAIL_USER}>`,
    to: customer.email,
    subject: `Order Update · ${orderNumber} — ${s.label}`,
    html,
  });
}

// ── Booking Emails ────────────────────────────────────────
async function sendBookingEmails(booking) {
  const { name, email, phone, store, date, time, message } = booking;

  const detailsHtml = `
    <table style="border-collapse:collapse;width:100%;font-family:Georgia,serif;">
      <tr><td style="padding:8px 0;color:#888;font-size:13px;">Name</td><td style="padding:8px 0;font-size:14px;">${name}</td></tr>
      <tr><td style="padding:8px 0;color:#888;font-size:13px;">Email</td><td style="padding:8px 0;font-size:14px;">${email}</td></tr>
      <tr><td style="padding:8px 0;color:#888;font-size:13px;">Phone</td><td style="padding:8px 0;font-size:14px;">${phone || "—"}</td></tr>
      <tr><td style="padding:8px 0;color:#888;font-size:13px;">Store</td><td style="padding:8px 0;font-size:14px;">${store}</td></tr>
      <tr><td style="padding:8px 0;color:#888;font-size:13px;">Date</td><td style="padding:8px 0;font-size:14px;">${date}</td></tr>
      <tr><td style="padding:8px 0;color:#888;font-size:13px;">Time</td><td style="padding:8px 0;font-size:14px;">${time}</td></tr>
      ${message ? `<tr><td style="padding:8px 0;color:#888;font-size:13px;">Message</td><td style="padding:8px 0;font-size:14px;">${message}</td></tr>` : ""}
    </table>
  `;

  await transporter.sendMail({
    from: `"Sheinar   " <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Appointment Request — Sheinar",
    html: `
      <div style="${BASE}">
        ${header()}
        <h2 style="font-size:18px;font-weight:normal;">Dear ${name},</h2>
        <p style="font-size:14px;line-height:1.8;color:#444;">
          Thank you for requesting a private appointment at Sheinar. We have received your booking and will confirm your session within 24 hours.
        </p>
        ${HR}
        <h3 style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#888;margin-bottom:16px;">Appointment Details</h3>
        ${detailsHtml}
        ${footer()}
      </div>
    `,
  });

  await transporter.sendMail({
    from: `"Sheinar Bookings" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `New Appointment Request — ${name}`,
    html: `
      <div style="${BASE}">
        ${header()}
        <h2 style="font-size:18px;font-weight:normal;">New Booking Received</h2>
        ${HR}
        ${detailsHtml}
        ${footer()}
      </div>
    `,
  });
}

module.exports = { sendBookingEmails, sendOrderConfirmationEmail, sendOrderStatusEmail };
