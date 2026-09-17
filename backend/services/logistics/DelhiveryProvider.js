const ShippingProvider = require("./ShippingProvider");
const crypto = require("crypto");

class DelhiveryProvider extends ShippingProvider {
  constructor() {
    super("Delhivery", {
      apiKey: process.env.DELHIVERY_API_KEY,
      apiSecret: process.env.DELHIVERY_API_SECRET,
      endpoint: process.env.DELHIVERY_API_ENDPOINT || "https://track.delhivery.com",
    });
    this.assertConfig();
  }

  async createShipment(orderData) {
    const shipmentId = `DLV-${crypto.randomUUID().slice(0, 10).toUpperCase()}`;
    const trackingNumber = `DLV${Date.now().toString().slice(-10)}`;
    const estimatedDeliveryDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);

    return {
      shipmentId,
      trackingNumber,
      carrier: "Delhivery",
      provider: "Delhivery",
      labelUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/labels/${shipmentId}.pdf`,
      estimatedDeliveryDate,
      currentStatus: "shipment-created",
      currentLocation: "Sorting Hub",
      progressPercent: 12,
      events: [
        {
          status: "shipment-created",
          detail: "Shipment created with Delhivery",
          location: "Sorting Hub",
          progress: 12,
          timestamp: new Date(),
        },
      ],
    };
  }

  async trackShipment(trackingNumber) {
    const now = new Date();
    const statusMap = [
      { status: "picked-up", detail: "Delhivery pickup confirmed", progress: 30 },
      { status: "in-transit", detail: "Delhivery shipment in transit", progress: 58 },
      { status: "out-for-delivery", detail: "Delhivery courier out for delivery", progress: 90 },
      { status: "delivered", detail: "Delhivery shipment delivered", progress: 100 },
    ];
    const index = Math.min(statusMap.length - 1, Math.floor((Date.now() / (1000 * 60 * 45)) % statusMap.length));
    const selected = statusMap[index];

    return {
      provider: "Delhivery",
      trackingNumber,
      currentStatus: selected.status,
      currentLocation: selected.status === "delivered" ? "Destination" : "Regional Hub",
      estimatedDeliveryDate: new Date(Date.now() + (selected.status === "delivered" ? 0 : 1 * 24 * 60 * 60 * 1000)),
      progressPercent: selected.progress,
      event: {
        status: selected.status,
        detail: selected.detail,
        location: selected.status === "delivered" ? "Delivery Address" : "Regional Hub",
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
      provider: "Delhivery",
    };
  }

  async getLabel(shipmentId) {
    return `${process.env.FRONTEND_URL || "http://localhost:5173"}/labels/${shipmentId}.pdf`;
  }
}

module.exports = DelhiveryProvider;
