import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useCurrency, CURRENCIES } from "@/context/CurrencyContext";

export function CurrencySelector({ isTransparent = false }: { isTransparent?: boolean }) {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1 font-sans text-[10px] tracking-[2px] uppercase ${isTransparent ? "text-white" : "text-foreground"} hover:text-accent transition-colors`}
        style={isTransparent ? { color: "white" } : undefined}
      >
        <span>{currency.flag}</span>
        <span>{currency.code}</span>
        <ChevronDown className={`h-2.5 w-2.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-3 w-52 bg-background border border-border shadow-[0_20px_60px_-10px_rgba(83,62,45,0.15)] z-50">
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              onClick={() => { setCurrency(c); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/50 transition-colors ${
                c.code === currency.code ? "bg-muted/30" : ""
              }`}
            >
              <span className="text-base">{c.flag}</span>
              <span className="font-sans text-[11px] tracking-[1px] text-foreground">{c.code}</span>
              <span className="font-serif text-[11px] text-muted-foreground ml-auto">{c.symbol}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
