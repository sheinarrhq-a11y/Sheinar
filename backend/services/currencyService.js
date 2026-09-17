const MINOR_UNITS = {
  INR: 2,
  USD: 2,
  EUR: 2,
  GBP: 2,
  AED: 2,
  CAD: 2,
  AUD: 2,
  SGD: 2,
  SAR: 2,
  JPY: 0,
};

const DEFAULT_RATES = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
  AED: 0.044,
  CAD: 0.016,
  AUD: 0.018,
  SGD: 0.016,
  SAR: 0.045,
  JPY: 1.82,
};

function supportedCurrencies() {
  const configured = String(process.env.RAZORPAY_SUPPORTED_CURRENCIES || "INR")
    .split(",")
    .map((currency) => currency.trim().toUpperCase())
    .filter(Boolean);
  return new Set(configured);
}

function getRate(currency) {
  let configured = DEFAULT_RATES;
  try {
    configured = process.env.FX_RATES_JSON ? JSON.parse(process.env.FX_RATES_JSON) : DEFAULT_RATES;
  } catch {
    const error = new Error("Currency conversion is unavailable.");
    error.status = 400;
    throw error;
  }
  const rate = Number(configured[currency]);
  if (!Number.isFinite(rate) || rate <= 0) {
    const error = new Error("Currency conversion is unavailable.");
    error.status = 400;
    throw error;
  }
  return rate;
}

function convertFromINR(amount, currency) {
  const code = String(currency || "").toUpperCase();
  if (!supportedCurrencies().has(code)) {
    const error = new Error("Unsupported currency.");
    error.status = 400;
    throw error;
  }
  const minorUnit = MINOR_UNITS[code];
  if (minorUnit === undefined) {
    const error = new Error("Unsupported currency.");
    error.status = 400;
    throw error;
  }
  const rate = getRate(code);
  const chargedAmount = Number((amount * rate).toFixed(minorUnit));
  if (!Number.isFinite(chargedAmount) || chargedAmount <= 0) {
    const error = new Error("Invalid converted amount.");
    error.status = 400;
    throw error;
  }
  return {
    baseCurrency: "INR",
    baseAmount: Number(amount.toFixed(2)),
    chargedCurrency: code,
    chargedAmount,
    currencyMinorUnit: minorUnit,
    gatewayAmount: Math.round(chargedAmount * (10 ** minorUnit)),
    exchangeRate: rate,
    exchangeRateSource: process.env.FX_RATES_JSON ? "configured" : "configured-default",
    exchangeRateTimestamp: new Date(),
  };
}

module.exports = { MINOR_UNITS, supportedCurrencies, convertFromINR };
