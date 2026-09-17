const ShippingProvider = require("./ShippingProvider");
const crypto = require("crypto");

class DHLProvider extends ShippingProvider {
  constructor() {
    super("DHL", {
      apiKey: process.env.DHL_API_KEY,
      apiSecret: process.env.DHL_API_SECRET,
      endpoint: process.env.DHL_API_ENDPOINT || "https://api.dhl.com",
    });
    this.assertConfig();
  }

  async createShipment(orderData) {
    const shipmentId = `DHL-${crypto.randomUUID().slice(0, 10).toUpperCase()}`;
    const trackingNumber = `DHL${Date.now().toString().slice(-10)}`;
    const estimatedDeliveryDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

    return {
      shipmentId,
      trackingNumber,
      carrier: "DHL",
      provider: "DHL",
      labelUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/labels/${shipmentId}.pdf`,
      estimatedDeliveryDate,
      currentStatus: "shipment-created",
      currentLocation: "Origin Facility",
      progressPercent: 10,
      events: [
        {
          status: "shipment-created",
          detail: "Shipment created with DHL",
          location: "Origin Facility",
          progress: 10,
          timestamp: new Date(),
        },
      ],
    };
  }

  async trackShipment(trackingNumber) {
    const now = new Date();
    const statusMap = [
      { status: "picked-up", detail: "Picked up by DHL courier", progress: 35 },
      { status: "in-transit", detail: "In transit with DHL", progress: 60 },
      { status: "out-for-delivery", detail: "Out for delivery", progress: 85 },
      { status: "delivered", detail: "Delivered by DHL", progress: 100 },
    ];
    const index = Math.min(statusMap.length - 1, Math.floor((Date.now() / (1000 * 60 * 60)) % statusMap.length));
    const selected = statusMap[index];

    return {
      provider: "DHL",
      trackingNumber,
      currentStatus: selected.status,
      currentLocation: selected.status === "delivered" ? "Destination" : "Transit Hub",
      estimatedDeliveryDate: new Date(Date.now() + (selected.status === "delivered" ? 0 : 2 * 24 * 60 * 60 * 1000)),
      progressPercent: selected.progress,
      event: {
        status: selected.status,
        detail: selected.detail,
        location: selected.status === "delivered" ? "Delivery Address" : "Transit Hub",
        progress: selected.progress,
        timestamp: now,
      },
    };
  }

  async cancelShipment(shipmentId, trackingNumber) {
    return {
      cancelled: true,
      cancelledAt: new Date(),
      reason: "Customer or admin requested cancellation.",
      trackingNumber,
      shipmentId,
      provider: "DHL",
    };
  }

  async getLabel(shipmentId) {
    return `${process.env.FRONTEND_URL || "http://localhost:5173"}/labels/${shipmentId}.pdf`;
  }
}

module.exports = DHLProvider;
