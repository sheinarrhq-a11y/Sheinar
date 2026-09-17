import { useState, useEffect, useRef } from "react";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}
import { motion, AnimatePresence } from "framer-motion";
import { Lock, CheckCircle2, Loader2, ShoppingBag, ChevronDown, ChevronUp, Truck, CreditCard, User, MapPin, Edit2 } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { useShop } from "@/context/ShopContext";
import { useCurrency, CURRENCIES } from "@/context/CurrencyContext";
import { Link } from "@tanstack/react-router";
import { clearPaymentAttempt, readPaymentAttempt, savePaymentAttempt, type PaymentAttemptSession } from "@/features/checkout/paymentSession";

const PERSIST_KEY = "sheinar_checkout_info";

type ShippingRate = {
  _id: string; name: string; scope: string; method: string;
  rateType: "flat" | "conditional" | "weight" | "free";
  price: number; freeAbove: number; belowPrice: number;
  pricePerKg: number; basePrice: number; eta: string; active: boolean;
};

type OrderInfo = {
  firstName: string; lastName: string; email: string; phone: string;
  country: string; state: string; city: string; address: string; postal: string;
};

const COUNTRIES = [
  "India","United States","United Kingdom","UAE","Canada",
  "Australia","Singapore","Saudi Arabia","Japan","Germany","France","Other",
];

const COUNTRY_CURRENCY: Record<string, string> = {
  India: "INR", "United States": "USD", "United Kingdom": "GBP",
  UAE: "AED", Canada: "CAD", Australia: "AUD",
  Singapore: "SGD", "Saudi Arabia": "SAR", Japan: "JPY", Germany: "EUR", France: "EUR",
};

function calcShipping(rate: ShippingRate, subtotal: number, kg = 0.5): number {
  switch (rate.rateType) {
    case "free": return 0;
    case "flat": return rate.price;
    case "conditional": return rate.freeAbove > 0 && subtotal >= rate.freeAbove ? 0 : rate.belowPrice;
    case "weight": return rate.basePrice + kg * rate.pricePerKg;
    default: return 0;
  }
}

function loadInfo(): OrderInfo {
  try { return JSON.parse(localStorage.getItem(PERSIST_KEY) || "null") ?? emptyInfo(); }
  catch { return emptyInfo(); }
}
function emptyInfo(): OrderInfo {
  return { firstName: "", lastName: "", email: "", phone: "", country: "India", state: "", city: "", address: "", postal: "" };
}

const API = import.meta.env.VITE_API_URL || "/api";

let razorpayLoader: Promise<void> | null = null;

function loadRazorpay(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  if (razorpayLoader) return razorpayLoader;

  razorpayLoader = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-razorpay="true"]');
    const script = existing || document.createElement("script");
    script.addEventListener("load", () => window.Razorpay ? resolve() : reject(new Error("Razorpay checkout failed to load.")), { once: true });
    script.addEventListener("error", () => reject(new Error("Razorpay checkout failed to load. Check your internet connection and try again.")), { once: true });
    if (!existing) {
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.dataset.razorpay = "true";
      document.body.appendChild(script);
    }
  }).catch((error) => {
    razorpayLoader = null;
    throw error;
  });

  return razorpayLoader;
}

const inp = "w-full bg-transparent border-0 border-b border-border py-3 px-0 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent transition-colors duration-200 font-serif text-sm";
const lbl = "block font-sans text-[9px] tracking-[2.5px] uppercase text-muted-foreground mb-1";

export function Checkout() {
  const { cart, clearCart } = useShop();
  const { currency, format, setCurrency } = useCurrency();
  const [info, setInfo] = useState<OrderInfo>(loadInfo);
  const [errors, setErrors] = useState<Partial<OrderInfo>>({});
  const [shipping, setShipping] = useState<ShippingRate[]>([]);
  const [selected, setSelected] = useState<ShippingRate | null>(null);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [paymentAttempt, setPaymentAttempt] = useState<PaymentAttemptSession | null>(null);
  const [infoLocked, setInfoLocked] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Persist info to localStorage on every change
  useEffect(() => {
    localStorage.setItem(PERSIST_KEY, JSON.stringify(info));
  }, [info]);

  // Auto-switch currency when country changes
  useEffect(() => {
    const code = COUNTRY_CURRENCY[info.country];
    if (code) {
      const c = CURRENCIES.find((x) => x.code === code);
      if (c) setCurrency(c);
    }
  }, [info.country, setCurrency]);

  // Auto-select shipping rate based on country
  useEffect(() => {
    if (!shipping.length) return;
    const scope = info.country === "India" ? "domestic" : "international";
    const match = shipping.find((r) => r.scope === scope || r.scope === "both");
    if (match) setSelected(match);
  }, [info.country, shipping]);

  // Load Razorpay script
  useEffect(() => {
    loadRazorpay().catch(() => {});
  }, []);

  // Fetch shipping rates
  useEffect(() => {
    fetch(`${API}/shipping`)
      .then((r) => r.json())
      .then((data: ShippingRate[]) => {
        const active = data.filter((r) => r.active);
        setShipping(active);
        const def = active.find((r) => r.scope === "domestic" || r.scope === "both");
        if (def) setSelected(def);
      })
      .catch(() => {});
  }, []);

  // Check pending payment on mount
  useEffect(() => {
    const saved = readPaymentAttempt();
    if (!saved?.attemptId || !saved.accessToken) return;
    setPaymentAttempt(saved);
    setInfoLocked(true);
    fetch(`${API}/payments/status/${saved.attemptId}`, {
      headers: { "X-Payment-Access-Token": saved.accessToken },
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Unable to reconcile payment status.");
        return data;
      })
      .then((data) => {
        if (data.order?.paymentStatus === "paid") {
          setOrderNumber(data.order.orderNumber || "");
          clearCart(); clearPaymentAttempt(); setConfirmed(true);
          return;
        }
        if (data.attempt?.status === "authorized") {
          setGlobalError("Your payment is being confirmed. Please wait before trying again.");
          return;
        }
        if (["created", "checkout_open", "pending"].includes(data.attempt?.status)) {
          fetch(`${API}/payments/cancel`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Payment-Access-Token": saved.accessToken },
            body: JSON.stringify({ attemptId: saved.attemptId, reason: "Checkout was reloaded before payment completed." }),
          }).catch(() => {});
        }
        clearPaymentAttempt();
        setPaymentAttempt(null);
        setInfoLocked(false);
      })
      .catch((error) => {
        setGlobalError(error instanceof Error ? error.message : "Unable to reconcile payment status.");
        setInfoLocked(true);
      });
  }, [clearCart]);

  const availableRates = shipping.filter((r) => {
    const scope = info.country === "India" ? "domestic" : "international";
    return r.scope === scope || r.scope === "both";
  });

  const subtotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const cartWeight = cart.reduce((s, i) => s + (i.product.weightKg ?? 0.5) * i.qty, 0);
  const shippingCost = selected ? calcShipping(selected, subtotal, cartWeight) : 0;
  const total = subtotal + shippingCost;

  function field(key: keyof OrderInfo, value: string) {
    setInfo((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<OrderInfo> = {};
    if (!info.firstName.trim()) e.firstName = "Required";
    if (!info.lastName.trim()) e.lastName = "Required";
    if (!/^\S+@\S+\.\S+$/.test(info.email)) e.email = "Invalid email";
    if (!/^\d{7,}$/.test(info.phone.replace(/\D/g, ""))) e.phone = "Invalid phone";
    if (!info.address.trim()) e.address = "Required";
    if (!info.city.trim()) e.city = "Required";
    if (!info.state.trim()) e.state = "Required";
    if (!info.postal.trim()) e.postal = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handlePay() {
    if (loading) return;
    setGlobalError("");
    if (!validate()) {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (!selected) { setGlobalError("Please select a shipping method."); return; }
    setLoading(true);
    setInfoLocked(true);
    let attempt: PaymentAttemptSession | null = null;
    try {
      await loadRazorpay();
      const idempotencyKey = window.crypto.randomUUID();
      const res = await fetch(`${API}/payments/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
        body: JSON.stringify({
          items: cart.map((i) => ({ productId: i.product.id, quantity: i.qty, size: i.size || "" })),
          customer: { firstName: info.firstName, lastName: info.lastName, email: info.email, phone: info.phone },
          shippingAddress: { address: info.address, city: info.city, state: info.state, pin: info.postal, country: info.country },
          shippingId: selected._id,
          currency: currency.code,
        }),
      });
      const order = await res.json();
      if (!res.ok) throw new Error(order.error || "Unable to start payment.");
      attempt = { attemptId: order.attemptId, accessToken: order.accessToken };
      setPaymentAttempt(attempt);
      savePaymentAttempt(attempt);
      if (!window.Razorpay) throw new Error("Razorpay checkout failed to load. Please try again.");

      const payment = await new Promise<{ razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: order.keyId, amount: order.amount, currency: order.currency,
          name: "Sheinar", description: "Sheinar order",
          order_id: order.razorpayOrderId,
          prefill: { name: `${info.firstName} ${info.lastName}`, email: info.email, contact: info.phone },
          theme: { color: "#8a6848" },
          handler: resolve,
          modal: { ondismiss: () => reject(new Error("cancelled")) },
        });
        rzp.open();
      });

      const verify = await fetch(`${API}/payments/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...attempt, razorpayOrderId: payment.razorpay_order_id, razorpayPaymentId: payment.razorpay_payment_id, razorpaySignature: payment.razorpay_signature }),
      });
      const vData = await verify.json();
      if (!verify.ok) throw new Error(vData.error || "Payment verification failed.");
      setOrderNumber(vData.order?.orderNumber || vData.orderNumber || "");
      clearCart(); clearPaymentAttempt();
      localStorage.removeItem(PERSIST_KEY);
      setConfirmed(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Payment failed.";
      if (msg === "cancelled") {
        setGlobalError("Payment was cancelled. You can try again.");
        if (attempt) {
          fetch(`${API}/payments/cancel`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Payment-Access-Token": attempt.accessToken },
            body: JSON.stringify({ attemptId: attempt.attemptId }),
          }).catch(() => {});
          clearPaymentAttempt();
          setPaymentAttempt(null);
        }
      } else {
        setGlobalError(msg);
      }
      setInfoLocked(false);
    } finally {
      setLoading(false);
    }
  }

  // ── Empty cart ──
  if (cart.length === 0 && !confirmed) {
    return (
      <SiteLayout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mb-6" strokeWidth={1} />
          <span className="lux-eyebrow block mb-3">Your Bag</span>
          <h2 className="font-serif text-3xl text-foreground mb-4">Your bag is empty</h2>
          <p className="font-serif italic text-mocha mb-8">Add some heirlooms before checking out.</p>
          <Link to="/" className="lux-btn">Continue Shopping</Link>
        </div>
      </SiteLayout>
    );
  }

  // ── Confirmed ──
  if (confirmed) {
    return (
      <SiteLayout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}>
              <CheckCircle2 className="h-16 w-16 text-accent mx-auto mb-6" strokeWidth={1} />
            </motion.div>
            <span className="lux-eyebrow block mb-4">Order Confirmed</span>
            <div className="lux-divider mx-auto mb-6" />
            <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-4">Thank you, {info.firstName}.</h2>
            <p className="font-serif italic text-mocha max-w-md mx-auto mb-3 leading-relaxed">
              Your order has been placed. Our atelier will reach out within 24 hours with your order details and timeline.
            </p>
            {orderNumber && <p className="font-sans text-xs tracking-widest uppercase text-accent mb-2">Order · {orderNumber}</p>}
            <p className="font-sans text-xs tracking-widest uppercase text-muted-foreground mb-10">
              A confirmation has been sent to {info.email}
            </p>
            <Link to="/" className="lux-btn">Return to Maison</Link>
          </motion.div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="min-h-screen pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="text-center mb-10">
            <span className="lux-eyebrow block mb-2">Secure Checkout</span>
            <h1 className="font-serif text-3xl text-foreground">Complete Your Order</h1>
          </div>

          {/* Mobile order summary toggle */}
          <div className="lg:hidden mb-6 border border-border">
            <button
              onClick={() => setSummaryOpen((v) => !v)}
              className="w-full flex items-center justify-between px-5 py-4 text-sm font-sans"
            >
              <span className="flex items-center gap-2 text-accent">
                <ShoppingBag className="h-4 w-4" />
                {summaryOpen ? "Hide" : "Show"} order summary
                {summaryOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </span>
              <span className="font-serif text-foreground text-base">{format(total)}</span>
            </button>
            <AnimatePresence>
              {summaryOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                  className="overflow-hidden border-t border-border"
                >
                  <OrderSummary cart={cart} subtotal={subtotal} shippingCost={shippingCost} total={total} format={format} currency={currency.code} selected={selected} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid lg:grid-cols-[1fr_380px] gap-10 lg:gap-16 items-start">

            {/* ── LEFT: Form ── */}
            <form ref={formRef} onSubmit={(e) => { e.preventDefault(); handlePay(); }} className="space-y-10">

              {/* Section 1 — Contact */}
              <Section icon={<User className="h-4 w-4" />} title="Contact Information"
                locked={infoLocked} onEdit={() => setInfoLocked(false)}
              >
                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
                  <Field label="First Name" error={errors.firstName}>
                    <input className={inp} placeholder="Anu" value={info.firstName} onChange={(e) => field("firstName", e.target.value)} />
                  </Field>
                  <Field label="Last Name" error={errors.lastName}>
                    <input className={inp} placeholder="Kaushal" value={info.lastName} onChange={(e) => field("lastName", e.target.value)} />
                  </Field>
                  <Field label="Email Address" error={errors.email} className="sm:col-span-2">
                    <input type="email" className={inp} placeholder="your@email.com" value={info.email} onChange={(e) => field("email", e.target.value)} />
                  </Field>
                  <Field label="Phone Number" error={errors.phone} className="sm:col-span-2">
                    <input type="tel" className={inp} placeholder="+91 98765 43210" value={info.phone} onChange={(e) => field("phone", e.target.value)} />
                  </Field>
                </div>
              </Section>

              {/* Section 2 — Shipping Address */}
              <Section icon={<MapPin className="h-4 w-4" />} title="Shipping Address"
                locked={infoLocked} onEdit={() => setInfoLocked(false)}
              >
                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
                  <Field label="Street Address" error={errors.address} className="sm:col-span-2">
                    <input className={inp} placeholder="House / Flat / Street" value={info.address} onChange={(e) => field("address", e.target.value)} />
                  </Field>
                  <Field label="City" error={errors.city}>
                    <input className={inp} placeholder="Varanasi" value={info.city} onChange={(e) => field("city", e.target.value)} />
                  </Field>
                  <Field label="State / Province" error={errors.state}>
                    <input className={inp} placeholder="Uttar Pradesh" value={info.state} onChange={(e) => field("state", e.target.value)} />
                  </Field>
                  <Field label="PIN / ZIP Code" error={errors.postal}>
                    <input className={inp} placeholder="221001" value={info.postal} onChange={(e) => field("postal", e.target.value)} />
                  </Field>
                  <Field label="Country">
                    <select className={inp + " cursor-pointer"} value={info.country} onChange={(e) => field("country", e.target.value)}>
                      {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </Field>
                </div>
              </Section>

              {/* Section 3 — Shipping Method */}
              <Section icon={<Truck className="h-4 w-4" />} title="Shipping Method">
                {availableRates.length === 0 ? (
                  <p className="font-serif italic text-muted-foreground text-sm">Loading shipping options…</p>
                ) : (
                  <div className="space-y-3">
                    {availableRates.map((rate) => {
                      const cost = calcShipping(rate, subtotal, cartWeight);
                      const active = selected?._id === rate._id;
                      return (
                        <button key={rate._id} type="button" onClick={() => setSelected(rate)}
                          className={`w-full flex items-center justify-between px-5 py-4 border transition-all duration-200 text-left ${active ? "border-accent bg-accent/5" : "border-border hover:border-accent/40"}`}
                        >
                          <div className="flex items-center gap-4">
                            <span className={`h-4 w-4 rounded-full border-2 flex-shrink-0 transition-colors ${active ? "border-accent bg-accent" : "border-muted-foreground"}`} />
                            <div>
                              <p className="font-serif text-foreground text-sm">{rate.name || rate.method}</p>
                              <p className="font-sans text-[11px] text-muted-foreground mt-0.5">{rate.eta}</p>
                            </div>
                          </div>
                          <span className="font-serif text-foreground text-sm ml-4">
                            {cost === 0 ? <span className="text-accent">Free</span> : format(cost)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </Section>

              {/* Section 4 — Payment */}
              <Section icon={<CreditCard className="h-4 w-4" />} title="Payment">
                <div className="bg-muted/30 border border-border px-5 py-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <img src="https://razorpay.com/favicon.ico" alt="Razorpay" className="h-5 w-5 rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    <p className="font-serif text-foreground text-sm">Secure payment via Razorpay</p>
                  </div>
                  <p className="font-sans text-[11px] text-muted-foreground leading-relaxed">
                    Accepts Credit / Debit cards, UPI, Net Banking & Wallets.
                    {currency.code !== "INR" && ` Prices shown in ${currency.code}. Payment processed in INR.`}
                  </p>
                  <div className="flex gap-2 flex-wrap pt-1">
                    {["Visa", "Mastercard", "RuPay", "UPI", "Netbanking"].map((b) => (
                      <span key={b} className="font-sans text-[9px] tracking-[2px] uppercase border border-border px-2 py-1 text-muted-foreground">{b}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  <span className="font-sans text-[10px] tracking-widest uppercase">256-bit SSL encrypted</span>
                </div>
              </Section>

              {/* Error */}
              {globalError && (
                <p className="text-destructive font-serif italic text-sm border border-destructive/30 bg-destructive/5 px-4 py-3">
                  {globalError}
                </p>
              )}

              {/* Pay button */}
              <button
                type="submit"
                disabled={loading}
                className="lux-btn w-full justify-center text-base py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing…</>
                ) : (
                  <><Lock className="h-4 w-4 mr-2" /> Pay {format(total)}</>
                )}
              </button>

              <p className="text-center font-sans text-[10px] tracking-widest uppercase text-muted-foreground">
                By placing your order you agree to our terms & privacy policy
              </p>
            </form>

            {/* ── RIGHT: Sticky Summary ── */}
            <div className="hidden lg:block sticky top-28">
              <OrderSummary cart={cart} subtotal={subtotal} shippingCost={shippingCost} total={total} format={format} currency={currency.code} selected={selected} />
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

// ── Section wrapper ──
function Section({ icon, title, children, locked, onEdit }: {
  icon: React.ReactNode; title: string; children: React.ReactNode; locked?: boolean; onEdit?: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-accent">{icon}</span>
          <h2 className="font-serif text-xl text-foreground">{title}</h2>
        </div>
        {locked && onEdit && (
          <button type="button" onClick={onEdit} className="flex items-center gap-1.5 font-sans text-[10px] tracking-[2px] uppercase text-muted-foreground hover:text-accent transition-colors">
            <Edit2 className="h-3 w-3" /> Edit
          </button>
        )}
      </div>
      <div className={locked ? "opacity-60 pointer-events-none" : ""}>{children}</div>
    </motion.div>
  );
}

// ── Field wrapper ──
function Field({ label, error, children, className = "" }: {
  label: string; error?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={className}>
      <label className={lbl}>{label}</label>
      {children}
      {error && <p className="font-sans text-[10px] text-destructive mt-1">{error}</p>}
    </div>
  );
}

// ── Order Summary ──
function OrderSummary({ cart, subtotal, shippingCost, total, format, currency, selected }: {
  cart: { product: { id: string; title: string; image: string; collection: string; price: number }; qty: number; size?: string }[];
  subtotal: number; shippingCost: number; total: number;
  format: (n: number) => string; currency: string; selected: ShippingRate | null;
}) {
  return (
    <div className="bg-muted/20 border border-border p-6 space-y-6">
      <h3 className="font-sans text-[10px] tracking-[3px] uppercase text-muted-foreground">Order Summary</h3>

      {/* Items */}
      <div className="space-y-4">
        {cart.map((item) => (
          <div key={`${item.product.id}-${item.size}`} className="flex gap-4">
            <div className="relative shrink-0">
              <img src={item.product.image || undefined} alt={item.product.title} className="w-16 h-20 object-cover bg-muted" />
              <span className="absolute -top-2 -right-2 bg-foreground text-secondary text-[10px] h-5 w-5 rounded-full flex items-center justify-center">{item.qty}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-serif text-foreground text-sm leading-snug">{item.product.title}</p>
              <p className="font-sans text-[10px] tracking-widest uppercase text-muted-foreground mt-0.5">{item.product.collection}</p>
              {item.size && <p className="font-sans text-[10px] text-muted-foreground mt-0.5">Size: {item.size}</p>}
              <p className="font-serif text-foreground text-sm mt-1">{format(item.product.price * item.qty)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="border-t border-border pt-4 space-y-2.5">
        <div className="flex justify-between font-sans text-xs text-muted-foreground">
          <span>Subtotal</span><span className="font-serif text-foreground">{format(subtotal)}</span>
        </div>
        <div className="flex justify-between font-sans text-xs text-muted-foreground">
          <span>Shipping</span>
          <span className="font-serif text-foreground">
            {selected ? (shippingCost === 0 ? <span className="text-accent">Free</span> : format(shippingCost)) : "—"}
          </span>
        </div>
        <div className="flex justify-between font-serif text-base text-foreground border-t border-border pt-3 mt-1">
          <span>Total</span>
          <div className="text-right">
            <span>{format(total)}</span>
            {currency !== "INR" && <p className="font-sans text-[10px] text-muted-foreground mt-0.5">Charged in INR</p>}
          </div>
        </div>
      </div>

      <p className="font-sans text-[10px] text-muted-foreground leading-relaxed">
        {currency === "INR" ? "Prices inclusive of applicable taxes." : `Displayed in ${currency}. Payment processed in INR via Razorpay.`}
      </p>
    </div>
  );
}
