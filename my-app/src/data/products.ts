export type ProductVariant = { size: "S" | "M" | "L"; stock: number };

export type Product = {
  id: string;
  slug: string;
  title: string;
  collection: string;
  shopCategory: string;
  price: number;
  currency: string;
  image: string;
  images: string[];
  status: "in-stock" | "preorder" | "sold-out";
  hidden?: boolean;
  sku: string;
  description: string;
  details: string[];
  shipping?: string;
  care?: string;
  manufacturer?: string;
  dimensions?: string;
  variants?: ProductVariant[];
  weightKg?: number;
};

// In dev: uses Vite proxy (/api → localhost:5000)
// In prod: uses VITE_API_URL from .env.production
const API = import.meta.env.VITE_API_URL || "/api";

function normaliseImages(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((i) =>
      typeof i === "string" ? i : (i as { url?: string }).url ?? ""
    ).filter(Boolean);
  }
  return [];
}

function apiToProduct(p: Record<string, unknown>): Product {
  const imgs = normaliseImages(p.images);
  const fallbackImage = typeof p.image === "string" ? p.image : "";
  return {
    id: (p._id ?? p.id) as string,
    slug: p.slug as string,
    title: p.title as string,
    collection: p.collection as string,
    shopCategory: (p.shopCategory as string) || "",
    price: p.price as number,
    currency: (p.currency as string) || "INR",
    image: imgs[0] ?? fallbackImage,
    images: imgs.length ? imgs : fallbackImage ? [fallbackImage] : [],
    status: p.status as Product["status"],
    hidden: (p.hidden as boolean) || false,
    sku: p.sku as string,
    description: p.description as string,
    details: (p.details as string[]) || [],
    shipping: p.shipping as string | undefined,
    care: p.care as string | undefined,
    manufacturer: p.manufacturer as string | undefined,
    dimensions: p.dimensions as string | undefined,
    variants: (p.variants as ProductVariant[] | undefined) || [],
    weightKg: (p.weightKg as number | undefined) ?? 0.5,
  };
}

let _cache: Product[] | null = null;
let _cacheTime = 0;
const CACHE_TTL = 30_000; // 30 seconds

export async function fetchProducts(): Promise<Product[]> {
  if (_cache && Date.now() - _cacheTime < CACHE_TTL) return _cache;
  try {
    const res = await fetch(`${API}/products`, { cache: "no-store" });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data: Record<string, unknown>[] = await res.json();
    if (Array.isArray(data) && data.length) {
      _cache = data.map(apiToProduct).filter((p) => !p.hidden);
      _cacheTime = Date.now();
      return _cache;
    }

    _cache = [];
    _cacheTime = Date.now();
    return _cache;
  } catch {
    _cache = [];
    _cacheTime = Date.now();
    return _cache;
  }
}

export function getProducts(): Product[] {
  return _cache ?? [];
}

export const products: Product[] = [];

export const collections: Collection[] = [];

export type Collection = {
  slug: string;
  title: string;
  image: string;
  tag: string;
  products?: Product[];
};

function apiToCollection(c: Record<string, unknown>): Collection {
  const prods = (c.products as Record<string, unknown>[] | undefined) ?? [];
  return {
    slug: c.slug as string,
    title: c.title as string,
    image: (c.image as { url: string } | undefined)?.url ?? "",
    tag: (c.tag as string) || "",
    products: prods.map(apiToProduct),
  };
}

let _colCache: Collection[] | null = null;
let _colCacheTime = 0;

export async function fetchCollections(): Promise<Collection[]> {
  if (_colCache && Date.now() - _colCacheTime < CACHE_TTL) return _colCache;
  try {
    const res = await fetch(`${API}/collections`, { cache: "no-store" });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data: Record<string, unknown>[] = await res.json();
    if (Array.isArray(data) && data.length) {
      _colCache = data.map(apiToCollection);
      _colCacheTime = Date.now();
      return _colCache;
    }

    _colCache = [];
    _colCacheTime = Date.now();
    return _colCache;
  } catch {
    _colCache = [];
    _colCacheTime = Date.now();
    return _colCache;
  }
}

export function getCollections(): Collection[] {
  return _colCache ?? [];
}

export const formatPrice = (n: number, c = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(n);
