const DHLProvider = require("./DHLProvider");
const DelhiveryProvider = require("./DelhiveryProvider");
const BlueDartProvider = require("./BlueDartProvider");

const providers = {
  DHL: DHLProvider,
  Delhivery: DelhiveryProvider,
  "Blue Dart": BlueDartProvider,
  BlueDart: BlueDartProvider,
};

function getLogisticsProvider(providerName) {
  const Provider = providers[providerName] || providers.Delhivery;
  return new Provider();
}

function getProviderNames() {
  return Object.keys(providers);
}

module.exports = { getLogisticsProvider, getProviderNames };
