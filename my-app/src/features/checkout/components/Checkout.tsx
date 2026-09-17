import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Lock, CheckCircle2, Loader2 } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { useShop } from "@/context/ShopContext";
import { useCurrency } from "@/context/CurrencyContext";
import { Link } from "@tanstack/react-router";

type Step = "information" | "shipping" | "payment" | "confirmed";

type ShippingRate = {
  _id: string;
  name: string;
  scope: string;
  method: string;
  rateType: "flat" | "conditional" | "weight" | "free";
  price: number;
  freeAbove: number;
  belowPrice: number;
  pricePerKg: number;
  basePrice: number;
  eta: string;
  active: boolean;
};

function calcShippingCost(
  rate: ShippingRate,
  subtotal: number,
  weightKg = 0.5
): number {
  switch (rate.rateType) {
    case "free":
      return 0;
    case "flat":
      return rate.price;
    case "conditional":
      return rate.freeAbove > 0 && subtotal >= rate.freeAbove
        ? 0
        : rate.belowPrice;
    case "weight":
      return rate.basePrice + weightKg * rate.pricePerKg;
    default:
      return 0;
  }
}

const COUNTRY_CURRENCY: Record<string, string> = {
  India: "INR",
  "United States": "USD",
  "United Kingdom": "GBP",
  UAE: "AED",
  Canada: "CAD",
  Australia: "AUD",
  Singapore: "SGD",
  "Saudi Arabia": "SAR",
  Japan: "JPY",
  Germany: "EUR",
};

const inputCls =
  "w-full border border-border bg-transparent px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors duration-300 font-serif text-sm";
const labelCls =
  "block font-sans text-[10px] tracking-[2px] uppercase text-muted-foreground mb-1.5";

const API = import.meta.env.VITE_API_URL || "/api";

type OrderInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  address: string;
  postal: string;
  shippingId?: string;
};

export function Checkout() {
  const { cart, clearCart } = useShop();
  const { currency, format } = useCurrency();
  const [step, setStep] = useState<Step>("information");
  const [info, setInfo] = useState<OrderInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "India",
    state: "",
    city: "",
    address: "",
    postal: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shipping, setShipping] = useState<ShippingRate[]>([]);
  const [selected, setSelected] = useState<ShippingRate | null>(null);
  const [orderNumber, setOrderNumber] = useState("");
  const availableShipping = shipping.filter((rate) =>
    info.country === "India" ? rate.scope === "domestic" : rate.scope === "international"
  );

  useEffect(() => {
    if (window.Razorpay) return;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { if (document.body.contains(script)) document.body.removeChild(script); };
  }, []);

  useEffect(() => {
    const fetchShipping = async () => {
      try {
        const res = await fetch(`${API}/shipping`);
        const data = await res.json();
        const activeRates = data.filter((r: ShippingRate) => r.active);
        setShipping(activeRates);
        const domesticDefault = activeRates.find((r: ShippingRate) => r.scope === "domestic");
        if (domesticDefault) setSelected(domesticDefault);
      } catch (e) {
        console.error("Error fetching shipping:", e);
      }
    };
    fetchShipping();
  }, []);

  useEffect(() => {
    const scope = info.country === "India" ? "domestic" : "international";
    setSelected((current) => current?.scope === scope
      ? current
      : shipping.find((rate) => rate.scope === scope) || null);
  }, [info.country, shipping]);

  function validateInfo(): boolean {
    if (
      !info.firstName ||
      !info.lastName ||
      !info.email ||
      !info.phone ||
      !info.country ||
      !info.state ||
      !info.city ||
      !info.address ||
      !info.postal
    ) {
      setError("All fields are required.");
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(info.email)) {
      setError("Invalid email.");
      return false;
    }
    if (!/^\d{10,}$/.test(info.phone.replace(/\D/g, ""))) {
      setError("Invalid phone number.");
      return false;
    }
    return true;
  }

  async function handleSubmitInfo(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (validateInfo()) setStep("shipping");
  }

  async function handleSubmitShipping(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) {
      setError("Please select a shipping method.");
      return;
    }
    setInfo({ ...info, shippingId: selected._id });
    setStep("payment");
  }

  async function handleSubmitPayment() {
    setError("");
    setLoading(true);
    try {
      const paymentOrderRes = await fetch(`${API}/orders/create-razorpay-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalINR: total, currency: currency.code }),
      });
      const paymentOrder = await paymentOrderRes.json();
      if (!paymentOrderRes.ok) throw new Error(paymentOrder.error || "Unable to start payment.");
      if (!window.Razorpay) throw new Error("Payment checkout is still loading. Please try again.");

      const payment = await new Promise<{ razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }>((resolve, reject) => {
        const checkout = new window.Razorpay({
          key: paymentOrder.keyId,
          amount: paymentOrder.amount,
          currency: paymentOrder.currency,
          name: "Sheinar   ",
          description: "Sheinar order",
          order_id: paymentOrder.razorpayOrderId,
          prefill: { name: `${info.firstName} ${info.lastName}`, email: info.email, contact: info.phone },
          theme: { color: "#8a6848" },
          handler: resolve,
          modal: { ondismiss: () => reject(new Error("Payment was cancelled.")) },
        });
        checkout.open();
      });

      const res = await fetch(`${API}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.product.id,
            title: item.product.title,
            image: item.product.image,
            collection: item.product.collection,
            price: item.product.price,
            currency: "INR",
            qty: item.qty,
            size: item.size || "",
          })),
          customer: { firstName: info.firstName, lastName: info.lastName, email: info.email, phone: info.phone },
          shippingAddress: { address: info.address, city: info.city, state: info.state, pin: info.postal, country: info.country },
          shippingMethod: selected?.method || "standard",
          paymentMethod: "razorpay",
          subtotal,
          shippingCost,
          tax: 0,
          total,
          currency: "INR",
          razorpayOrderId: payment.razorpay_order_id,
          razorpayPaymentId: payment.razorpay_payment_id,
          razorpaySignature: payment.razorpay_signature,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create order.");

      setOrderNumber(data.orderNumber || data._id);
      clearCart();
      setStep("confirmed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating order.");
    } finally {
      setLoading(false);
    }
  }

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const shippingCost = selected ? calcShippingCost(selected, subtotal) : 0;
  const total = subtotal + shippingCost;

  if (cart.length === 0 && step !== "confirmed") {
    return (
      <SiteLayout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
          <span className="lux-eyebrow block mb-4">Your Bag</span>
          <h2 className="font-serif text-3xl text-foreground mb-4">
            Your bag is empty
          </h2>
          <p className="font-serif italic text-mocha mb-8">
            Add some heirlooms before checking out.
          </p>
          <Link to="/" className="lux-btn">
            Continue Shopping
          </Link>
        </div>
      </SiteLayout>
    );
  }

  if (step === "confirmed") {
    return (
      <SiteLayout>
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <CheckCircle2
              className="h-16 w-16 text-accent mx-auto mb-6"
              strokeWidth={1}
            />
            <span className="lux-eyebrow block mb-4">Order Confirmed</span>
            <div className="lux-divider mx-auto mb-6" />
            <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-4">
              Thank you, {info.firstName}.
            </h2>
            <p className="font-serif italic text-mocha max-w-md mx-auto mb-3 leading-relaxed">
              Your order has been placed. Our    will reach out within 24
              hours with your order details and timeline.
            </p>
            {orderNumber && (
              <p className="font-sans text-xs tracking-widest uppercase text-accent mb-2">
                Order · {orderNumber}
              </p>
            )}
            <p className="font-sans text-xs tracking-widest uppercase text-muted-foreground mb-10">
              A confirmation has been sent to {info.email}
            </p>
            <Link to="/" className="lux-btn">
              Return to Maison
            </Link>
          </motion.div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Progress */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            {(["information", "shipping", "payment", "confirmed"] as const).map(
              (s, i) => (
                <div
                  key={s}
                  className={`flex-1 ${i > 0 ? "before:content-[''] before:flex-1 before:h-px before:bg-border before:mr-4" : ""}`}
                >
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-sans font-semibold ${
                      step === s
                        ? "bg-accent text-secondary"
                        : ["information", "shipping", "payment"].indexOf(s) <
                              ["information", "shipping", "payment"].indexOf(
                                step
                              )
                            ? "bg-accent text-secondary"
                            : "bg-border text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </div>
                </div>
              )
            )}
          </div>
          <div className="text-center">
            <span className="lux-eyebrow capitalize">{step}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_350px] gap-12">
          {/* Main */}
          <form onSubmit={handleSubmitInfo}>
            {step === "information" && (
              <div className="space-y-6">
                <h2 className="font-serif text-2xl">Shipping Information</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { key: "firstName", label: "First Name" },
                    { key: "lastName", label: "Last Name" },
                    { key: "email", label: "Email" },
                    { key: "phone", label: "Phone" },
                    { key: "country", label: "Country" },
                    { key: "state", label: "State" },
                    { key: "city", label: "City" },
                    { key: "postal", label: "Postal Code" },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className={labelCls}>{label}</label>
                      <input
                        className={inputCls}
                        placeholder={label}
                        value={info[key as keyof OrderInfo] || ""}
                        onChange={(e) =>
                          setInfo({
                            ...info,
                            [key]: e.target.value,
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className={labelCls}>Street Address</label>
                  <textarea
                    className={inputCls + " resize-none"}
                    rows={3}
                    placeholder="123 Main Street"
                    value={info.address}
                    onChange={(e) =>
                      setInfo({ ...info, address: e.target.value })
                    }
                  />
                </div>
                {error && (
                  <p className="text-destructive font-serif text-sm italic">
                    {error}
                  </p>
                )}
                <button type="submit" className="lux-btn w-full justify-center">
                  Continue to Shipping <ChevronRight className="h-4 w-4 ml-2" />
                </button>
              </div>
            )}

            {step === "shipping" && (
              <div className="space-y-6">
                <h2 className="font-serif text-2xl">Shipping Method</h2>
                <div className="space-y-3">
                  {availableShipping.map((rate) => (
                    <button
                      key={rate._id}
                      type="button"
                      onClick={() => setSelected(rate)}
                      className={`w-full text-left p-4 border-2 transition-colors ${
                        selected?._id === rate._id
                          ? "border-accent bg-accent/5"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-serif text-foreground">
                            {rate.method}
                          </p>
                          <p className="font-sans text-xs text-muted-foreground">
                            {rate.eta}
                          </p>
                        </div>
                        <span className="font-serif text-foreground">
                          {format(calcShippingCost(rate, subtotal))}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
                {error && (
                  <p className="text-destructive font-serif text-sm italic">
                    {error}
                  </p>
                )}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep("information")}
                    className="lux-btn-outline flex-1 justify-center"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitShipping}
                    className="lux-btn flex-1 justify-center"
                  >
                    Continue <ChevronRight className="h-4 w-4 ml-2" />
                  </button>
                </div>
              </div>
            )}

            {step === "payment" && (
              <div className="space-y-6">
                <h2 className="font-serif text-2xl">Secure Payment</h2>
                <div className="border border-border bg-muted/40 p-6">
                  <p className="font-serif text-foreground mb-2">
                    Complete your payment securely with Razorpay.
                  </p>
                  <p className="font-serif italic text-sm text-muted-foreground">
                    Your order will be created immediately after Razorpay confirms the payment.
                  </p>
                </div>
                {error && (
                  <p className="text-destructive font-serif text-sm italic">
                    {error}
                  </p>
                )}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep("shipping")}
                    className="lux-btn-outline flex-1 justify-center"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitPayment}
                    disabled={loading}
                    className="lux-btn flex-1 justify-center"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Pay securely with Razorpay
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Summary */}
          <motion.div className="bg-muted p-6 sticky top-24 h-fit">
            <h3 className="font-serif text-lg mb-6">Order Summary</h3>
            <div className="space-y-3 mb-6 pb-6 border-b border-border">
              {cart.map((item) => (
                <div
                  key={`${item.product.id}-${item.size || "default"}`}
                  className="flex justify-between text-sm font-serif"
                >
                  <span className="text-muted-foreground">
                    {item.product.title} × {item.qty}
                  </span>
                  <span className="text-foreground">
                    {format(item.product.price * item.qty)}
                  </span>
                </div>
              ))}
            </div>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm font-serif text-muted-foreground">
                <span>Subtotal</span>
                <span>{format(subtotal)}</span>
              </div>
              {step !== "information" && (
                <div className="flex justify-between text-sm font-serif text-muted-foreground">
                  <span>Shipping</span>
                  <span>
                    {format(shippingCost)}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-serif text-lg text-foreground pt-3 border-t border-border">
                <span>Total</span>
                <span>
                  {format(step !== "information" ? total : subtotal)}
                </span>
              </div>
            </div>
            <p className="font-sans text-[10px] text-muted-foreground text-center">
              All prices in {currency.code}
            </p>
          </motion.div>
        </div>
      </div>
    </SiteLayout>
  );
}
