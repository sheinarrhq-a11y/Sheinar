import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ChevronRight, Truck, Ruler, Sparkles, Info, X, ChevronLeft, ChevronRight as ChevronRightIcon } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ProductCard } from "@/components/product/ProductCard";
import { fetchProducts } from "@/data/products";
import { useShop } from "@/context/ShopContext";
import { useUser } from "@/context/UserContext";
import { useCurrency } from "@/context/CurrencyContext";

// Parse **bold** markdown to React
function parseDetailMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    const all = await fetchProducts();
    const p = all.find((x: { slug: string }) => x.slug === params.slug);
    if (!p) throw notFound();
    return { product: p, all };
  },
  notFoundComponent: () => (
    <SiteLayout>
      <div className="pt-44 pb-32 text-center">
        <h1 className="lux-heading text-4xl mb-4">Piece not found</h1>
        <Link to="/collections" className="lux-btn mt-6">Browse Collections</Link>
      </div>
    </SiteLayout>
  ),
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="pt-44 pb-32 text-center">
        <h1 className="lux-heading text-3xl">Something went wrong</h1>
        <p className="text-mocha mt-2">{error.message}</p>
      </div>
    </SiteLayout>
  ),
  component: ProductPage,
});

// ── Size Chart Modal ──────────────────────────────────────────────────────────
function SizeChartModal({ onClose }: { onClose: () => void }) {
  const topSizes = [
    // { size: "6 (XXS)", bust: 30, waist: 24, hips: 34 },
    // { size: "8 (XS)", bust: 32, waist: 26, hips: 36 },
    { size: "10 (S)", bust: 34, waist: 28, hips: 38 },
    { size: "12 (M)", bust: 36, waist: 30, hips: 40 },
    { size: "14 (L)", bust: 38, waist: 32, hips: 42 },
    // { size: "16 (XL)", bust: 41, waist: 35, hips: 45 },
    // { size: "18 (XXL)", bust: 44, waist: 38, hips: 48 },
    // { size: "20 (XXXL)", bust: 47, waist: 41, hips: 54 },
  ];

  const bottomSizes = [
    // { size: "6 (XXS)", waist: 24, hips: 34 },
    // { size: "8 (XS)", waist: 26, hips: 36 },
    { size: "10 (S)", waist: 28, hips: 38 },
    { size: "12 (M)", waist: 30, hips: 40 },
    { size: "14 (L)", waist: 32, hips: 42 },
    // { size: "16 (XL)", waist: 34, hips: 45 },
    // { size: "18 (XXL)", waist: 36, hips: 48 },
    // { size: "20 (XXXL)", waist: 38, hips: 51 },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="bg-background border border-border w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border">
            <div>
              <span className="lux-eyebrow block mb-1 text-xs tracking-[3px] uppercase text-muted-foreground">
                Sheinar
              </span>
              <h3 className="font-serif text-2xl text-foreground">
                Size Guide
              </h3>
            </div>

            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-6 py-6 space-y-8 max-h-[85vh] overflow-y-auto">
            {/* Measurement Guidelines */}
            <div className="bg-muted/30 border border-border rounded-lg p-5">
              <h4 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-[2px]">
                Measurement Guidelines
              </h4>

              <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                <li>• Measurements should be taken directly on your body.</li>
                <li>
                  • Measure around the fullest part of your bust with arms down
                  by your side.
                </li>
                <li>
                  • Measure around the narrowest part of your waistline, above
                  navel and below ribcage.
                </li>
                <li>
                  • Measure around the fullest part of your hips.
                </li>
                <li>• We follow standard UK sizing.</li>
              </ul>
            </div>

            {/* TOP SIZE CHART */}
            <div>
              <h4 className="font-serif text-lg mb-4 text-foreground">
                Body Measurements For Top (in Inches)
              </h4>

              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="px-4 py-3 text-left uppercase tracking-[2px] text-xs">
                        Size
                      </th>
                      <th className="px-4 py-3 text-left uppercase tracking-[2px] text-xs">
                        Bust
                      </th>
                      <th className="px-4 py-3 text-left uppercase tracking-[2px] text-xs">
                        Waist
                      </th>
                      <th className="px-4 py-3 text-left uppercase tracking-[2px] text-xs">
                        Hips
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {topSizes.map((row) => (
                      <tr
                        key={row.size}
                        className="border-t border-border hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-foreground">
                          {row.size}
                        </td>
                        <td className="px-4 py-3">{row.bust}"</td>
                        <td className="px-4 py-3">{row.waist}"</td>
                        <td className="px-4 py-3">{row.hips}"</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* BOTTOM SIZE CHART */}
            <div>
              <h4 className="font-serif text-lg mb-4 text-foreground">
                Body Measurements For Bottom (in Inches)
              </h4>

              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="px-4 py-3 text-left uppercase tracking-[2px] text-xs">
                        Size
                      </th>
                      <th className="px-4 py-3 text-left uppercase tracking-[2px] text-xs">
                        Waist
                      </th>
                      <th className="px-4 py-3 text-left uppercase tracking-[2px] text-xs">
                        Hips
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {bottomSizes.map((row) => (
                      <tr
                        key={row.size}
                        className="border-t border-border hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-foreground">
                          {row.size}
                        </td>
                        <td className="px-4 py-3">{row.waist}"</td>
                        <td className="px-4 py-3">{row.hips}"</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* INTERNATIONAL CONVERSION
            <div>
              <h4 className="font-serif text-lg mb-4 text-foreground">
                International Size Conversion
              </h4>

              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs uppercase tracking-[2px]">
                        Region
                      </th>
                      <th className="px-4 py-3 text-left">XXS</th>
                      <th className="px-4 py-3 text-left">XS</th>
                      <th className="px-4 py-3 text-left">S</th>
                      <th className="px-4 py-3 text-left">M</th>
                      <th className="px-4 py-3 text-left">L</th>
                      <th className="px-4 py-3 text-left">XL</th>
                    </tr>
                  </thead>

                  <tbody>
                    {[
                      {
                        region: "UK",
                        values: [6, 8, 10, 12, 14, 16],
                      },
                      {
                        region: "US",
                        values: [2, 4, 6, 8, 10, 12],
                      },
                      {
                        region: "Italy",
                        values: [38, 40, 42, 44, 46, 48],
                      },
                      {
                        region: "France",
                        values: [34, 36, 38, 40, 42, 44],
                      },
                      {
                        region: "Australia",
                        values: [6, 8, 10, 12, 14, 16],
                      },
                    ].map((row) => (
                      <tr
                        key={row.region}
                        className="border-t border-border hover:bg-muted/20"
                      >
                        <td className="px-4 py-3 font-medium">
                          {row.region}
                        </td>

                        {row.values.map((value, idx) => (
                          <td key={idx} className="px-4 py-3">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div> */}

            {/* Footer */}
            <div className="border-t border-border pt-5">
              <p className="text-xs text-muted-foreground italic leading-relaxed">
                All measurements are in inches. For a custom fit, please
                contact our    directly — every Sheinar piece can be made
                to your exact measurements.
              </p>

              <button
                onClick={onClose}
                className="lux-btn w-full justify-center mt-6"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Image Gallery ─────────────────────────────────────────────────────────────
function ImageGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const prev = useCallback(() => setActive((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setActive((i) => (i + 1) % images.length), [images.length]);

  function onTouchStart(e: React.TouchEvent) { touchStartX.current = e.touches[0].clientX; }
  function onTouchEnd(e: React.TouchEvent) {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
  }

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="space-y-3">
      {/* Main image */}
      <div
        className="relative bg-muted aspect-[4/5] overflow-hidden select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={images[active]}
            alt={title}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="h-full w-full object-cover"
            draggable={false}
          />
        </AnimatePresence>

        {/* Prev / Next arrows — visible on desktop, hidden on mobile (swipe instead) */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 hidden lg:flex h-9 w-9 items-center justify-center bg-background/80 backdrop-blur hover:bg-background transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-foreground" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex h-9 w-9 items-center justify-center bg-background/80 backdrop-blur hover:bg-background transition-colors"
            >
              <ChevronRightIcon className="h-4 w-4 text-foreground" />
            </button>
          </>
        )}

        {/* Mobile dot indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 lg:hidden">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`h-1 transition-all duration-300 ${i === active ? "w-6 bg-foreground" : "w-2 bg-foreground/30"}`}
              />
            ))}
          </div>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <span className="absolute top-3 right-3 bg-background/70 backdrop-blur text-foreground text-[10px] tracking-[2px] px-2 py-1 hidden lg:block">
            {active + 1} / {images.length}
          </span>
        )}
      </div>

      {/* Thumbnails — desktop grid, mobile horizontal scroll */}
      {images.length > 1 && (
        <div className="flex  gap-2 overflow-x-auto pb-1 lg:grid lg:grid-cols-4 lg:overflow-visible scrollbar-hide">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={` shrink-0 w-20 lg:w-auto bg-muted aspect-square overflow-hidden border-2 transition-all duration-200 ${
                i === active ? "border-accent" : "border-transparent hover:border-border"
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" draggable={false} />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ── Tab lines helper ──────────────────────────────────────────────────────────
function tabLines(text?: string) {
  if (!text) return [];
  return text.split("\n").filter(Boolean);
}

// ── Product Page ──────────────────────────────────────────────────────────────
function ProductPage() {
  const { product: p, all } = Route.useLoaderData();
  const { addToCart, setCartOpen } = useShop();
  const { wishlist, toggleWishlist } = useUser();
  const { format } = useCurrency();
  const navigate = useNavigate();
  const [size, setSize] = useState<string>("");
  const [agreed, setAgreed] = useState(false);
  const [sizeChart, setSizeChart] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const liked = wishlist.includes(p.id);

  const images = p.images?.length ? p.images : [p.image];
  const others = all.filter((x: { id: string }) => x.id !== p.id);

  // Only show sizes that have variants defined (with stock > 0 or just defined)
  const availableSizes = p.variants?.length
    ? p.variants.map((v: { size: string }) => v.size)
    : [] as string[];

  const selectedVariant = p.variants?.find(
    (v: { size: string; stock: number }) => v.size === size
  );
  const availableQuantity = selectedVariant?.stock ?? 0;
  const availabilityMessage = selectedVariant
    ? availableQuantity > 1
      ? `${availableQuantity} available to order`
      : availableQuantity === 1
      ? "1 available to order"
      : "Sold out in selected size"
    : p.status === "in-stock"
    ? "Available to order"
    : "";

  // Auto-select first available size
  useEffect(() => {
    if (availableSizes.length > 0 && !size) setSize(availableSizes[0]);
  }, [availableSizes.join(",")]);

  function handleAddToCart() {
    addToCart(p);
    setCartOpen(true);
  }

  function handlePreOrder() {
    if (!agreed) return;
    addToCart(p);
    navigate({ to: "/checkout" });
  }

  const tabs = [
    {
      icon: Truck, label: "Shipping & Delivery",
      lines: tabLines(p.shipping) || [
        "· Sheinar ships across the world via BlueDart, DTDC, DHL, UBX or FedEx express services.",
        "· A tracking number will be provided to track your shipment online.",
        "· Deliveries within India take roughly 3–5 working days. International deliveries take around 5–10 working days.",
        "· Domestic shipping within India is complimentary. International shipping is free for orders above ₹25,000.",
        "· All international shipments are sent as Delivery Duty Paid (DDP).",
      ],
    },
    {
      icon: Ruler, label: "Dimensions",
      lines: tabLines(p.dimensions) || [
        "· Saree — L 5.4 m × W 1.1 m", "· Blouse — 90 cm × W 1.1 m",
        "· Dupatta — L 2.4 m × W 1.01 m",
        "· All our garments are made to order. Please contact us for precise measurements.",
      ],
    },
    {
      icon: Sparkles, label: "Care",
      lines: tabLines(p.care) || [
        "· Store carefully, away from the sun, dust, and moisture, preferably in muslin cloth.",
        "· Regularly air and refold the garment.",
        "· Dry-clean only when required.",
        "· Avoid ironing directly on the zari and any direct contact with perfume.",
      ],
    },
    {
      icon: Info, label: "The Maker",
      lines: tabLines(p.manufacturer) || [
        "· Manufactured & Packaged by: Sheinar   ,  Mohali, India.",
        "· For feedback and complaints, email us at sheinarrhq@gmail.com or call +917719666903.",
        "· Country of Origin — India",
      ],
    },
  ].filter((t) => t.lines.length > 0);

  return (
    <SiteLayout>
      <div className="pt-32 px-6 lg:px-12 max-w-[1500px] mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[9px] tracking-[2px] uppercase text-mocha mb-10">
          <Link to="/" className="hover:text-accent">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/collections" className="hover:text-accent">Collections</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{p.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* ── Image Gallery ── */}
          <ImageGallery images={images} title={p.title} />

          {/* ── Details ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="lg:sticky lg:top-32 lg:self-start"
          >
            <span className="lux-eyebrow">{p.collection}</span>
            <h1 className="font-serif text-4xl md:text-5xl mt-4 mb-2">{p.title}</h1>
            <p className="font-serif text-2xl text-mocha">{format(p.price)}</p>
            <p className="text-xs text-mocha mt-2 tracking-widest uppercase">SKU · {p.sku}</p>

            <div className="my-8 h-px bg-border" />

            <p className="font-serif italic text-mocha leading-relaxed text-[16px]">{p.description}</p>
            
            {p.details.length > 0 && (
              <ul className="mt-6 space-y-2">
                {p.details.map((d: string) => (
                  <li key={d} className="text-sm text-mocha flex gap-2">
                    <span className="text-accent">·</span> <span>{parseDetailMarkdown(d)}</span>
                  </li>
                ))}
              </ul>
            )}
<p className="mt-4 text-xs italic leading-relaxed text-muted-foreground">
              Please note: Product colours may vary slightly from the images due to lighting, photography, and screen settings. The actual product may differ slightly.
            </p>
            {/* Status badge */}
            <div className="mt-8">
              <span className={`text-[11px] tracking-[3px] uppercase ${
                p.status === "in-stock" ? "text-accent" : p.status === "sold-out" ? "text-destructive" : "text-mocha"
              }`}>
                {p.status === "in-stock" ? "In    — Ready to Ship" : p.status === "sold-out" ? "Archived" : ""}
              </span>
            </div>
            {availabilityMessage && (
              <div className="mt-4">
                <p className="text-sm font-medium text-accent tracking-[0.3px]">
                  {availabilityMessage}
                </p>
              </div>
            )}
             {/* Size selector — only if variants exist */}
            {p.status !== "sold-out" && availableSizes.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] tracking-[3px] uppercase">Size</p>
                  <button
                    onClick={() => setSizeChart(true)}
                    className="cursor-pointer text-[11px] tracking-[2px] uppercase text-mocha hover:text-accent transition-colors flex items-center gap-1"
                  >
                    <Ruler className="h-3 w-3 cursor-pointer" /> View Size Chart
                  </button>
                </div>
                <div className="flex gap-2 ">
                  {availableSizes.map((s: string) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={` cursor-pointer w-12 h-12 border text-sm font-serif transition-all ${
                        size === s
                          ? "border-foreground bg-foreground text-secondary"
                          : "border-border text-foreground hover:border-foreground"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pre-order consent */}
            {p.status === "preorder" && (
              <label className="mt-6 block text-sm text-mocha cursor-pointer">
                <h2 className="text-base font-medium mb-3">Pre-Order timelines - 6-8 week</h2>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="accent-accent"
                  />
                  <span>
                  I understand that this is a pre-order and have read the despatch timeline
                  </span>
                </div>
              </label>
            )}

            {/* CTA buttons */}
            <div className="mt-8 flex gap-3">
              {p.status === "in-stock" && (
                <button onClick={handleAddToCart} className="lux-btn  flex-1 justify-center">Add to Bag</button>
              )}
              {p.status === "preorder" && (
                <button
                  onClick={handlePreOrder}
                  disabled={!agreed}
                  className="lux-btn bg-foreground text-secondary flex-1 justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  Pre-Order Now  
                </button>
              )}
              {p.status === "sold-out" && (
                <button className="lux-btn flex-1 justify-center">Enquire Now</button>
              )}
              <button
                onClick={() => toggleWishlist(p.id)}
                className=" cursor-pointer border border-foreground h-[46px] w-[46px] inline-flex items-center justify-center hover:bg-foreground hover:text-secondary transition-all"
              >
                <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
              </button>
            </div>

            {/* Tabs */}
            <div className="mt-12">
              {/* Tab row */}
              <div className="flex cursor-pointer overflow-x-auto scrollbar-hide border-b border-border">
                {tabs.map((t, i) => (
                  <button
                    key={t.label}
                    onClick={() => setActiveTab(i)}
                    className={` cursor-pointer shrink-0 inline-flex items-center gap-2 px-4 py-3 font-sans text-[10px] tracking-[2px] uppercase transition-colors border-b-2 -mb-px whitespace-nowrap ${
                      activeTab === i
                        ? "border-accent text-accent"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <t.icon className="h-3.5 w-3.5 "  />
                    {t.label}
                  </button>
                ))}
              </div>
              {/* Tab content */}
              <ul className="text-[15px] text-mocha mt-4 font-serif italic space-y-2 leading-relaxed px-1">
                {tabs[activeTab]?.lines.map((line, i) => <li key={i}>{line}</li>)}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* You May Also Like */}
        {others.length > 0 && (
          <section className="mt-32 mb-24">
            <div className="text-center mb-14">
              {/* <span className="lux-eyebrow">Pairs Beautifully With</span> */}
              <h2 className="lux-heading text-3xl md:text-4xl mt-3">You May Also Like</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
              {others.slice(0, 4).map((x: Parameters<typeof ProductCard>[0]["p"], i: number) => (
                <ProductCard key={x.id} p={x} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Size Chart Modal */}
      {sizeChart && <SizeChartModal onClose={() => setSizeChart(false)} />}
    </SiteLayout>
  );
}
