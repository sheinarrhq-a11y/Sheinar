import { createContext, useContext, useState, type ReactNode } from "react";

export type CurrencyCode = "INR" | "USD" | "GBP" | "EUR" | "AED" | "CAD" | "AUD" | "SGD" | "SAR" | "JPY";

export type CurrencyOption = {
  code: CurrencyCode;
  symbol: string;
  label: string;
  flag: string;
  rate: number; // relative to INR
};

export const CURRENCIES: CurrencyOption[] = [
  { code: "INR", symbol: "₹",  label: "Indian Rupee",        flag: "🇮🇳", rate: 1       },
  { code: "USD", symbol: "$",  label: "US Dollar",           flag: "🇺🇸", rate: 0.012   },
  { code: "GBP", symbol: "£",  label: "British Pound",       flag: "🇬🇧", rate: 0.0095  },
  { code: "EUR", symbol: "€",  label: "Euro",                flag: "🇪🇺", rate: 0.011   },
  { code: "AED", symbol: "د.إ",label: "UAE Dirham",          flag: "🇦🇪", rate: 0.044   },
  { code: "CAD", symbol: "C$", label: "Canadian Dollar",     flag: "🇨🇦", rate: 0.016   },
  { code: "AUD", symbol: "A$", label: "Australian Dollar",   flag: "🇦🇺", rate: 0.018   },
  { code: "SGD", symbol: "S$", label: "Singapore Dollar",    flag: "🇸🇬", rate: 0.016   },
  { code: "SAR", symbol: "﷼",  label: "Saudi Riyal",         flag: "🇸🇦", rate: 0.045   },
  { code: "JPY", symbol: "¥",  label: "Japanese Yen",        flag: "🇯🇵", rate: 1.82    },
];

type CurrencyState = {
  currency: CurrencyOption;
  setCurrency: (c: CurrencyOption) => void;
  convert: (inrAmount: number) => number;
  format: (inrAmount: number) => string;
};

const CurrencyContext = createContext<CurrencyState | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyOption>(() => {
    const saved = localStorage.getItem("sheinar_currency");
    return CURRENCIES.find((c) => c.code === saved) ?? CURRENCIES[0];
  });

  function handleSet(c: CurrencyOption) {
    localStorage.setItem("sheinar_currency", c.code);
    setCurrency(c);
  }

  function convert(inrAmount: number) {
    return Math.round(inrAmount * currency.rate * 100) / 100;
  }

  function format(inrAmount: number) {
    const amount = convert(inrAmount);
    // JPY has no decimals, others show 2
    const decimals = currency.code === "JPY" ? 0 : 2;
    return `${currency.symbol}${amount.toLocaleString("en", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: handleSet, convert, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
