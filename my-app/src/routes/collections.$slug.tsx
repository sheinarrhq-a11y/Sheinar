import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, ChevronDown, Sparkles, Feather, Flower, Star } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ProductCard } from "@/components/product/ProductCard";
import { fetchCollections, fetchProducts, type Product } from "@/data/products";

export const Route = createFileRoute("/collections/$slug")({
  loader: async ({ params }) => {
    const [collections, allProducts] = await Promise.all([fetchCollections(), fetchProducts()]);
    const c = collections.find((x) => x.slug === params.slug);
    if (!c) throw notFound();
    const byCollection = allProducts.filter(
      (p) => p.collection && p.collection.toLowerCase() === c.title.toLowerCase()
    );
    // If products have collection set, filter by it; otherwise show all API products
    const items = c.products?.length
      ? c.products
      : byCollection.length
      ? byCollection
      : allProducts;
    return { c, items };
  },
  notFoundComponent: () => (
    <SiteLayout>
      <div className="pt-44 pb-32 text-center">
        <h1 className="lux-heading text-4xl mb-4">Collection not found</h1>
        <Link to="/collections" className="lux-btn mt-6">All Collections</Link>
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
  component: CollectionPage,
});

type SortKey = "curator" | "price-asc" | "price-desc";
type StatusFilter = "all" | "in-stock" | "preorder" | "sold-out";

const PRICE_RANGES = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under ₹1,00,000", min: 0, max: 100000 },
  { label: "₹1,00,000 – ₹2,50,000", min: 100000, max: 250000 },
  { label: "₹2,50,000 – ₹5,00,000", min: 250000, max: 500000 },
  { label: "Above ₹5,00,000", min: 500000, max: Infinity },
];

function parseStatusFilter(value?: string): StatusFilter {
  if (value === "in-stock" || value === "preorder" || value === "sold-out") return value;
  return "all";
}

function parseSortKey(value?: string): SortKey {
  if (value === "price-asc" || value === "price-desc") return value;
  return "curator";
}

function parsePriceIdx(value?: string): number {
  const idx = Number(value);
  return Number.isInteger(idx) && idx >= 0 && idx < PRICE_RANGES.length ? idx : 0;
}

function AccordionSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-4 font-sans text-[11px] tracking-[2px] uppercase text-foreground hover:text-accent transition-colors"
      >
        {title}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-4 space-y-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterPanel({
  status, setStatus,
  priceIdx, setPriceIdx,
  sort, setSort,
  onClear, activeCount,
}: {
  status: StatusFilter; setStatus: (v: StatusFilter) => void;
  priceIdx: number; setPriceIdx: (v: number) => void;
  sort: SortKey; setSort: (v: SortKey) => void;
  onClear: () => void; activeCount: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="lux-eyebrow">Filters</span>
        {activeCount > 0 && (
          <button onClick={onClear} className="font-sans text-[10px] tracking-[2px] uppercase text-accent hover:text-foreground transition-colors flex items-center gap-1">
            <X className="h-3 w-3" /> Clear ({activeCount})
          </button>
        )}
      </div>

      <AccordionSection title="Availability" defaultOpen>
        {(["all", "in-stock", "preorder", "sold-out"] as StatusFilter[]).map((s) => (
          <label key={s} className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio"
              name="status"
              value={s}
              checked={status === s}
              onChange={() => setStatus(s)}
              className="sr-only"
            />
            <span className={`h-3.5 w-3.5 border flex items-center justify-center shrink-0 transition-colors ${status === s ? "border-accent bg-accent" : "border-border group-hover:border-foreground"}`}>
              {status === s && <span className="block h-1.5 w-1.5 bg-accent-foreground" />}
            </span>
            <span className={`font-serif text-sm capitalize transition-colors ${status === s ? "text-foreground" : "text-mocha group-hover:text-foreground"}`}>
              {s === "all" ? "All" : s === "in-stock" ? "In Stock" : s === "preorder" ? "Pre-Order" : "Sold Out"}
            </span>
          </label>
        ))}
      </AccordionSection>

      <AccordionSection title="Price" defaultOpen>
        {PRICE_RANGES.map((r, i) => (
          <label key={r.label} className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio"
              name="price"
              value={String(i)}
              checked={priceIdx === i}
              onChange={() => setPriceIdx(i)}
              className="sr-only"
            />
            <span className={`h-3.5 w-3.5 border flex items-center justify-center shrink-0 transition-colors ${priceIdx === i ? "border-accent bg-accent" : "border-border group-hover:border-foreground"}`}>
              {priceIdx === i && <span className="block h-1.5 w-1.5 bg-accent-foreground" />}
            </span>
            <span className={`font-serif text-sm transition-colors ${priceIdx === i ? "text-foreground" : "text-mocha group-hover:text-foreground"}`}>
              {r.label}
            </span>
          </label>
        ))}
      </AccordionSection>

      <AccordionSection title="Sort By" defaultOpen>
        {([
          { key: "curator", label: "Curator's Sort" },
          { key: "price-asc", label: "Price: Low to High" },
          { key: "price-desc", label: "Price: High to Low" },
        ] as { key: SortKey; label: string }[]).map((s) => (
          <label key={s.key} className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio"
              name="sort"
              value={s.key}
              checked={sort === s.key}
              onChange={() => setSort(s.key)}
              className="sr-only"
            />
            <span className={`h-3.5 w-3.5 border flex items-center justify-center shrink-0 transition-colors ${sort === s.key ? "border-accent bg-accent" : "border-border group-hover:border-foreground"}`}>
              {sort === s.key && <span className="block h-1.5 w-1.5 bg-accent-foreground" />}
            </span>
            <span className={`font-serif text-sm transition-colors ${sort === s.key ? "text-foreground" : "text-mocha group-hover:text-foreground"}`}>
              {s.label}
            </span>
          </label>
        ))}
      </AccordionSection>
    </div>
  );
}

function CollectionPage() {
  const { c, items } = Route.useLoaderData();

  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const [status, setStatus] = useState<StatusFilter>(() => parseStatusFilter(searchParams.get("status") ?? undefined));
  const [priceIdx, setPriceIdx] = useState(() => parsePriceIdx(searchParams.get("price") ?? undefined));
  const [sort, setSort] = useState<SortKey>(() => parseSortKey(searchParams.get("sort") ?? undefined));
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const activeCount = (status !== "all" ? 1 : 0) + (priceIdx !== 0 ? 1 : 0) + (sort !== "curator" ? 1 : 0);

  function clearFilters() {
    setStatus("all");
    setPriceIdx(0);
    setSort("curator");
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    params.set("status", status);
    params.set("price", String(priceIdx));
    params.set("sort", sort);
    if (status === "all") params.delete("status");
    if (priceIdx === 0) params.delete("price");
    if (sort === "curator") params.delete("sort");
    const newQuery = params.toString();
    const newUrl = `${window.location.pathname}${newQuery ? `?${newQuery}` : ""}`;
    window.history.replaceState({}, "", newUrl);
  }, [status, priceIdx, sort]);

  const filtered = useMemo(() => {
    const range = PRICE_RANGES[priceIdx];
    let result = items.filter((p: Product) => {
      if (status !== "all" && p.status !== status) return false;
      if (p.price < range.min || p.price > range.max) return false;
      return true;
    });
    if (sort === "price-asc") result = [...result].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") result = [...result].sort((a, b) => b.price - a.price);
    return result;
  }, [items, status, priceIdx, sort]);

  const filterProps = { status, setStatus, priceIdx, setPriceIdx, sort, setSort, onClear: clearFilters, activeCount };

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative h-[45vh] sm:h-[55vh] md:h-[60vh] overflow-hidden">
        <img src={c.image} alt={c.title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-foreground/70" />

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <Sparkles className="absolute top-8 left-6 h-5 w-5 text-secondary/30" />
          <Feather className="absolute top-16 right-8 h-6 w-6 text-secondary/20 rotate-[15deg]" />
          <Flower className="absolute left-10 bottom-16 h-8 w-8 text-secondary/15" />
          <Sparkles className="absolute right-20 bottom-10 h-4 w-4 text-secondary/25" />
          <Star className="absolute left-1/2 top-24 h-4 w-4 text-secondary/20 -translate-x-1/2" />
        </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <span className="text-secondary lux-eyebrow">{c.tag}</span>
          <h1 className="font-serif text-secondary text-3xl sm:text-4xl md:text-6xl lg:text-7xl mt-4 max-w-3xl leading-tight">
            {c.title}
          </h1>
          <p className="font-serif italic  text-base sm:text-lg md:text-xl mt-6 max-w-2xl mx-auto">
            {/* {c.description} */}  Riwaayat is a timeless blend of heritage craftsmanship and contemporary elegance.
          </p>
        </div>
      </section>

      <section className="px-6 lg:px-12 py-20 max-w-[1500px] mx-auto">

        {/* Mobile top bar */}
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <p className="font-serif italic text-mocha text-sm">{filtered.length} pieces</p>
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="inline-flex items-center gap-2 font-sans text-[11px] tracking-[2px] uppercase border border-border px-4 py-2.5 hover:border-accent hover:text-accent transition-colors"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filter & Sort
            {activeCount > 0 && (
              <span className="bg-accent text-accent-foreground text-[9px] h-4 w-4 rounded-full inline-flex items-center justify-center">{activeCount}</span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Desktop sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <FilterPanel {...filterProps} />
          </aside>

          {/* Products */}
          <div className="lg:col-span-9">
            {/* Desktop top bar */}
            <div className="hidden lg:flex justify-between items-center mb-8">
              <p className="font-serif italic text-mocha">{filtered.length} pieces</p>
              {activeCount > 0 && (
                <button onClick={clearFilters} className="font-sans text-[10px] tracking-[2px] uppercase text-accent hover:text-foreground transition-colors flex items-center gap-1">
                  <X className="h-3 w-3" /> Clear filters
                </button>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="py-24 text-center">
                <p className="font-serif italic text-mocha text-lg mb-4">No pieces match your filters.</p>
                <button onClick={clearFilters} className="lux-btn">Clear Filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
                {filtered.map((p: Product, i: number) => <ProductCard key={p.id} p={p} index={i} />)}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileFilterOpen(false)}
              className="fixed inset-0 bg-foreground/40 z-50 lg:hidden"
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="fixed bottom-0 inset-x-0 z-50 bg-background max-h-[85vh] overflow-y-auto lg:hidden rounded-t-none"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-border sticky top-0 bg-background">
                <span className="lux-eyebrow">Filter & Sort</span>
                <button onClick={() => setMobileFilterOpen(false)}>
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="px-6 py-4">
                <FilterPanel {...filterProps} />
              </div>
              <div className="px-6 py-5 border-t border-border sticky bottom-0 bg-background">
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="lux-btn w-full justify-center"
                >
                  Show {filtered.length} Pieces
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </SiteLayout>
  );
}
