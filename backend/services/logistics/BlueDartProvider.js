const ShippingProvider = require("./ShippingProvider");
const crypto = require("crypto");

class BlueDartProvider extends ShippingProvider {
  constructor() {
    super("Blue Dart", {
      apiKey: process.env.BLUEDART_API_KEY,
      apiSecret: process.env.BLUEDART_API_SECRET,
      endpoint: process.env.BLUEDART_API_ENDPOINT || "https://api.bluedart.com",
    });
    this.assertConfig();
  }

  async createShipment(orderData) {
    const shipmentId = `BDT-${crypto.randomUUID().slice(0, 10).toUpperCase()}`;
    const trackingNumber = `BD${Date.now().toString().slice(-10)}`;
    const estimatedDeliveryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    return {
      shipmentId,
      trackingNumber,
      carrier: "Blue Dart",
      provider: "BlueDart",
      labelUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/labels/${shipmentId}.pdf`,
      estimatedDeliveryDate,
      currentStatus: "shipment-created",
      currentLocation: "Hub",
      progressPercent: 15,
      events: [
        {
          status: "shipment-created",
          detail: "Shipment created with Blue Dart",
          location: "Hub",
          progress: 15,
          timestamp: new Date(),
        },
      ],
    };
  }

  async trackShipment(trackingNumber) {
    const now = new Date();
    const statusMap = [
      { status: "picked-up", detail: "Blue Dart pickup complete", progress: 28 },
      { status: "in-transit", detail: "Blue Dart in transit", progress: 55 },
      { status: "out-for-delivery", detail: "Blue Dart out for delivery", progress: 88 },
      { status: "delivered", detail: "Blue Dart delivered to recipient", progress: 100 },
    ];
    const index = Math.min(statusMap.length - 1, Math.floor((Date.now() / (1000 * 60 * 50)) % statusMap.length));
    const selected = statusMap[index];

    return {
      provider: "BlueDart",
      trackingNumber,
      currentStatus: selected.status,
      currentLocation: selected.status === "delivered" ? "Destination" : "Distribution Center",
      estimatedDeliveryDate: new Date(Date.now() + (selected.status === "delivered" ? 0 : 1 * 24 * 60 * 60 * 1000)),
      progressPercent: selected.progress,
      event: {
        status: selected.status,
        detail: selected.detail,
        location: selected.status === "delivered" ? "Delivery Address" : "Distribution Center",
        progress: selected.progress,
        timestamp: now,
      },
    };
  }

  async cancelShipment(shipmentId, trackingNumber) {
    return {
      cancelled: true,
      cancelledAt: new Date(),
      reason: "Shipment cancelled by admin.",
      trackingNumber,
      shipmentId,
      provider: "BlueDart",
    };
  }

  async getLabel(shipmentId) {
    return `${process.env.FRONTEND_URL || "http://localhost:5173"}/labels/${shipmentId}.pdf`;
  }
}

module.exports = BlueDartProvider;
