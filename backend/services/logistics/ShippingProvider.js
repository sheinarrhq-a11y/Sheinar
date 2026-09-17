class ShippingProvider {
  constructor(name, config = {}) {
    this.name = name;
    this.apiKey = config.apiKey || null;
    this.apiSecret = config.apiSecret || null;
    this.endpoint = config.endpoint || null;
  }

  assertConfig() {
    if (!this.apiKey || !this.apiSecret) {
      console.warn(
        `[${this.name}] missing API credentials. Set ${this.name
          .toUpperCase()
          .replace(/ /g, '_')}_API_KEY and ${this.name
          .toUpperCase()
          .replace(/ /g, '_')}_API_SECRET in .env`
      );
    }
  }

  async createShipment(orderData) {
    throw new Error("createShipment() not implemented");
  }

  async trackShipment(trackingNumber) {
    throw new Error("trackShipment() not implemented");
  }

  async cancelShipment(shipmentId, trackingNumber) {
    throw new Error("cancelShipment() not implemented");
  }

  async getLabel(shipmentId) {
    throw new Error("getLabel() not implemented");
  }
}

module.exports = ShippingProvider;
