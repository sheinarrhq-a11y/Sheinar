const Shipment = require("../models/Shipment");
const TrackingEvent = require("../models/TrackingEvent");
const Notification = require("../models/Notification");
const Order = require("../models/Order");
const { getLogisticsProvider } = require("./logistics/providerFactory");
const { sendShipmentNotification, sendTrackingUpdateNotifications } = require("./notificationService");

const DEFAULT_STATUS = {
  paymentPending: "pending",
  paymentConfirmed: "paid",
  processing: "processing",
  shipmentCreated: "shipment-created",
  pickedUp: "picked-up",
  inTransit: "in-transit",
  outForDelivery: "out-for-delivery",
  delivered: "delivered",
  returned: "returned",
  cancelled: "cancelled",
  failedDelivery: "failed-delivery",
};

async function assignCarrier(order) {
  const country = order.shippingAddress?.country?.toLowerCase() || "india";
  if (country !== "india" && order.total > 0) return "DHL";
  if (order.shippingMethod === "express") return "Delhivery";
  return "BlueDart";
}

async function createShipmentForOrder(order, overrideProvider) {
  if (!order) throw new Error("Order required.");

  const providerName = overrideProvider || order.carrier || (await assignCarrier(order));
  const provider = getLogisticsProvider(providerName);

  const shipmentPayload = await provider.createShipment(order);
  const shipment = await Shipment.create({
    orderId: order._id,
    provider: shipmentPayload.provider,
    carrier: shipmentPayload.carrier,
    shipmentId: shipmentPayload.shipmentId,
    trackingNumber: shipmentPayload.trackingNumber,
    labelUrl: shipmentPayload.labelUrl,
    estimatedDeliveryDate: shipmentPayload.estimatedDeliveryDate,
    currentStatus: shipmentPayload.currentStatus,
    currentLocation: shipmentPayload.currentLocation,
    progressPercent: shipmentPayload.progressPercent,
    events: shipmentPayload.events,
  });

  order.carrier = shipmentPayload.carrier;
  order.shipmentId = shipmentPayload.shipmentId;
  order.trackingNumber = shipmentPayload.trackingNumber;
  order.logisticsProvider = shipmentPayload.provider;
  order.estimatedDeliveryDate = shipmentPayload.estimatedDeliveryDate;
  order.status = DEFAULT_STATUS.shipmentCreated;
  order.trackingHistory = shipmentPayload.events.map((event) => ({
    status: event.status,
    description: event.detail,
    location: event.location,
    progressPercent: event.progress,
    timestamp: event.timestamp,
  }));
  order.auditLogs = order.auditLogs || [];
  order.auditLogs.push({
    actor: "system",
    action: "shipment-created",
    notes: `Shipment created with ${shipmentPayload.provider}`,
    timestamp: new Date(),
  });

  await order.save();

  await sendShipmentNotification(order, shipment, "shipment-created");

  return { order, shipment };
}

async function cancelShipment(orderId, payload) {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found.");
  if (!order.trackingNumber || !order.shipmentId) throw new Error("No shipment to cancel.");

  const provider = getLogisticsProvider(order.logisticsProvider || order.carrier);
  const result = await provider.cancelShipment(order.shipmentId, order.trackingNumber);

  const shipment = await Shipment.findOneAndUpdate(
    { orderId: order._id, shipmentId: order.shipmentId },
    {
      currentStatus: DEFAULT_STATUS.cancelled,
      isActive: false,
      cancelledAt: result.cancelledAt || new Date(),
      cancelledReason: result.reason || "Cancelled by admin",
      $push: { events: {
        status: DEFAULT_STATUS.cancelled,
        detail: result.reason || "Shipment cancelled",
        location: "N/A",
        progress: 0,
        timestamp: result.cancelledAt || new Date(),
      } },
    },
    { new: true }
  );

  order.status = DEFAULT_STATUS.cancelled;
  order.auditLogs = order.auditLogs || [];
  order.auditLogs.push({
    actor: "admin",
    action: "shipment-cancelled",
    notes: result.reason || "Shipment cancelled",
    timestamp: new Date(),
  });
  await order.save();

  await sendShipmentNotification(order, shipment, "cancelled");

  return { order, shipment, result };
}

async function trackShipment(trackingNumber) {
  const shipment = await Shipment.findOne({ trackingNumber });
  if (!shipment) throw new Error("Shipment not found.");
  const provider = getLogisticsProvider(shipment.provider || shipment.carrier);
  const tracking = await provider.trackShipment(trackingNumber);
  return { shipment, tracking };
}

async function refreshActiveShipments() {
  const activeShipments = await Shipment.find({
    isActive: true,
    currentStatus: { $nin: [DEFAULT_STATUS.delivered, DEFAULT_STATUS.cancelled, DEFAULT_STATUS.returned, DEFAULT_STATUS.failedDelivery] },
  });

  const updated = [];
  for (const shipment of activeShipments) {
    try {
      const provider = getLogisticsProvider(shipment.provider || shipment.carrier);
      const tracking = await provider.trackShipment(shipment.trackingNumber);
      const event = tracking.event || {};
      const now = new Date();

      const newEvent = {
        status: tracking.currentStatus,
        detail: event.detail || `Status updated to ${tracking.currentStatus}`,
        location: event.location || tracking.currentLocation || shipment.currentLocation,
        progress: event.progress || tracking.progressPercent || shipment.progressPercent,
        timestamp: event.timestamp || now,
      };

      shipment.currentStatus = tracking.currentStatus;
      shipment.currentLocation = tracking.currentLocation || shipment.currentLocation;
      shipment.progressPercent = tracking.progressPercent || shipment.progressPercent;
      shipment.estimatedDeliveryDate = tracking.estimatedDeliveryDate || shipment.estimatedDeliveryDate;
      shipment.events.push(newEvent);
      if ([DEFAULT_STATUS.delivered, DEFAULT_STATUS.cancelled, DEFAULT_STATUS.returned, DEFAULT_STATUS.failedDelivery].includes(tracking.currentStatus)) {
        shipment.isActive = false;
      }
      await shipment.save();

      const order = await Order.findById(shipment.orderId);
      if (order) {
        order.status = tracking.currentStatus;
        order.trackingHistory = order.trackingHistory || [];
        order.trackingHistory.push({
          status: newEvent.status,
          description: newEvent.detail,
          location: newEvent.location,
          progressPercent: newEvent.progress,
          timestamp: newEvent.timestamp,
        });
        order.auditLogs = order.auditLogs || [];
        order.auditLogs.push({
          actor: "system",
          action: `status-updated:${tracking.currentStatus}`,
          notes: `Carrier update from ${shipment.provider}`,
          timestamp: new Date(),
        });
        await order.save();
        updated.push({ order, shipment, tracking });
        await sendTrackingUpdateNotifications(order, shipment, tracking);
      }
    } catch (error) {
      console.error("Tracking refresh failed for shipment", shipment._id, error?.message || error);
    }
  }

  return updated;
}

module.exports = {
  createShipmentForOrder,
  cancelShipment,
  trackShipment,
  refreshActiveShipments,
  DEFAULT_STATUS,
};
