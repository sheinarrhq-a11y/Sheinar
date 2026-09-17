const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function authHeaders() {
  const token = sessionStorage.getItem("admin_token");
  return { Authorization: `Bearer ${token}` };
}

function jsonHeaders() {
  return { ...authHeaders(), "Content-Type": "application/json" };
}

// ── Auth ──────────────────────────────────────────────────
export async function login(username: string, password: string) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  return data as { token: string; username: string };
}

// ── Bookings ──────────────────────────────────────────────
export async function getBookings(params?: { status?: string; page?: number }) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.page) qs.set("page", String(params.page));
  const res = await fetch(`${API}/admin/bookings?${qs}`, { headers: authHeaders() });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data as { bookings: Booking[]; total: number; pages: number; page: number };
}

export async function updateBookingStatus(id: string, status: string) {
  const res = await fetch(`${API}/admin/bookings/${id}`, {
    method: "PATCH", headers: jsonHeaders(), body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Update failed");
  return res.json();
}

export async function deleteBooking(id: string) {
  const res = await fetch(`${API}/admin/bookings/${id}`, { method: "DELETE", headers: authHeaders() });
  if (!res.ok) throw new Error("Delete failed");
}

// ── Products ──────────────────────────────────────────────
export async function getAdminProducts() {
  const res = await fetch(`${API}/products/admin`, { headers: authHeaders() });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  return res.json() as Promise<AdminProduct[]>;
}

export async function createProduct(formData: FormData) {
  const res = await fetch(`${API}/products`, {
    method: "POST", headers: authHeaders(), body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create product");
  return data as AdminProduct;
}

export async function updateProduct(id: string, formData: FormData) {
  const res = await fetch(`${API}/products/${id}`, {
    method: "PUT", headers: authHeaders(), body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update product");
  return data as AdminProduct;
}

export async function deleteProduct(id: string) {
  const res = await fetch(`${API}/products/${id}`, { method: "DELETE", headers: authHeaders() });
  if (!res.ok) throw new Error("Delete failed");
}

// ── Collections ─────────────────────────────────────────
export async function getAdminCollections() {
  const res = await fetch(`${API}/collections`, { headers: authHeaders() });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  return res.json() as Promise<AdminCollection[]>;
}

export async function getCollectionProducts() {
  const res = await fetch(`${API}/collections/admin/all-products`, { headers: authHeaders() });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  return res.json() as Promise<CollectionProduct[]>;
}

export async function createCollection(formData: FormData) {
  const res = await fetch(`${API}/collections`, {
    method: "POST", headers: authHeaders(), body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create collection");
  return data as AdminCollection;
}

export async function updateCollection(id: string, formData: FormData) {
  const res = await fetch(`${API}/collections/${id}`, {
    method: "PUT", headers: authHeaders(), body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update collection");
  return data as AdminCollection;
}

export async function deleteCollection(id: string) {
  const res = await fetch(`${API}/collections/${id}`, { method: "DELETE", headers: authHeaders() });
  if (!res.ok) throw new Error("Delete failed");
}

// ── Shipping Rates ───────────────────────────────────────
export async function getShippingRates() {
  const res = await fetch(`${API}/shipping/all`, { headers: authHeaders() });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  return res.json() as Promise<ShippingRate[]>;
}

export async function createShippingRate(data: Partial<ShippingRate>) {
  const res = await fetch(`${API}/shipping`, {
    method: "POST", headers: jsonHeaders(), body: JSON.stringify(data),
  });
  const d = await res.json();
  if (!res.ok) throw new Error(d.error || "Failed");
  return d as ShippingRate;
}

export async function updateShippingRate(id: string, data: Partial<ShippingRate>) {
  const res = await fetch(`${API}/shipping/${id}`, {
    method: "PUT", headers: jsonHeaders(), body: JSON.stringify(data),
  });
  const d = await res.json();
  if (!res.ok) throw new Error(d.error || "Failed");
  return d as ShippingRate;
}

export async function deleteShippingRate(id: string) {
  const res = await fetch(`${API}/shipping/${id}`, { method: "DELETE", headers: authHeaders() });
  if (!res.ok) throw new Error("Delete failed");
}

export async function seedShippingRates() {
  const res = await fetch(`${API}/shipping/seed`, { method: "POST", headers: authHeaders() });
  if (!res.ok) throw new Error("Seed failed");
  return res.json();
}

// ── Orders ──────────────────────────────────────────────
export async function getOrders(params?: { status?: string; page?: number }) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.page) qs.set("page", String(params.page));
  const res = await fetch(`${API}/orders?${qs}`, { headers: authHeaders() });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  // backend returns array; wrap for pagination
  if (Array.isArray(data)) {
    return { orders: data as AdminOrder[], total: data.length, pages: 1, page: 1 };
  }
  return data as { orders: AdminOrder[]; total: number; pages: number; page: number };
}

export async function updateOrderStatus(id: string, status: string) {
  const res = await fetch(`${API}/orders/${id}/status`, {
    method: "PATCH", headers: jsonHeaders(), body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Update failed");
  return res.json();
}

// ── Shipments ────────────────────────────────────────────
export async function createShipment(orderId: string, provider?: string) {
  const res = await fetch(`${API}/shipment/create`, {
    method: "POST", headers: jsonHeaders(), body: JSON.stringify({ orderId, provider }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create shipment");
  return data as { order: AdminOrder; shipment: AdminShipment };
}

export async function cancelShipment(orderId: string, reason?: string) {
  const res = await fetch(`${API}/shipment/cancel`, {
    method: "POST", headers: jsonHeaders(), body: JSON.stringify({ orderId, reason }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to cancel shipment");
  return data as { order: AdminOrder; shipment: AdminShipment };
}

export async function getCarriers() {
  return ["DHL", "Delhivery", "Blue Dart"];
}

export async function getAbandonedCartStats() {
  const res = await fetch(`${API}/abandoned-cart/stats`, { headers: authHeaders() });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to load abandoned cart stats");
  return data as AbandonedCartStats;
}

export async function getAbandonedCarts(params?: { status?: string; page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  const res = await fetch(`${API}/abandoned-cart?${qs}`, { headers: authHeaders() });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Unable to load abandoned carts");
  return data as { items: AbandonedCheckoutItem[]; total: number; pages: number; page: number };
}

// ── Types ─────────────────────────────────────────────────
export type AdminShipment = {
  _id: string;
  orderId: string;
  provider: string;
  carrier: string;
  shipmentId: string;
  trackingNumber: string;
  labelUrl?: string;
  currentStatus: string;
  currentLocation: string;
  progressPercent: number;
  estimatedDeliveryDate?: string;
  isActive: boolean;
  events: { status: string; detail: string; location: string; timestamp: string }[];
  createdAt: string;
};

export type AdminOrder = {
  _id: string;
  orderNumber: string;
  items: { productId: string; title: string; image?: string; collection?: string; price: number; currency: string; qty: number; size?: string }[];
  customer: { email: string; firstName: string; lastName?: string; phone?: string };
  shippingAddress: { address?: string; apt?: string; city?: string; state?: string; pin?: string; country?: string };
  shippingMethod: string;
  paymentMethod: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  currency: string;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed";
  carrier?: string;
  trackingNumber?: string;
  shipmentId?: string;
  logisticsProvider?: string;
  estimatedDeliveryDate?: string;
  razorpayOrderId?: string;
  createdAt: string;
};

// ── Types ─────────────────────────────────────────────────
export type AbandonedCheckoutItem = {
  _id: string;
  customerName: string;
  email: string;
  phone: string;
  status: "active" | "completed" | "expired";
  totalAmount: number;
  currency: string;
  checkoutStartedAt: string;
  completedAt?: string;
  reminderCount: number;
  reminderHistory: { channel: string; reminderType: string; sentAt: string; success: boolean; error?: string }[];
};
export type Booking = {
  _id: string; name: string; email: string; phone?: string;
  store: string; date: string; time: string; message?: string;
  status: "pending" | "confirmed" | "cancelled"; createdAt: string;
};

export type AdminProduct = {
  _id: string; title: string; slug: string; collection: string; shopCategory: string;
  price: number; currency: string; sku: string;
  status: "in-stock" | "preorder" | "sold-out";
  hidden: boolean;
  description: string; details: string[];
  images: { url: string; public_id: string }[];
  shipping: string; care: string; manufacturer: string; dimensions: string;
  variants: { size: "S" | "M" | "L"; stock: number }[];
  weightKg: number;
  sortOrder: number; createdAt: string;
};

export type CollectionProduct = {
  _id: string; title: string; slug: string; collection: string;
  images: { url: string; public_id: string }[];
  status: string;
};

export type AdminCollection = {
  _id: string; title: string; slug: string; tag: string;
  image?: { url: string; public_id: string };
  products: CollectionProduct[];
  sortOrder: number; createdAt: string;
};

export type AbandonedCartStat = {
  _id: string;
  total: number;
  success: number;
};

export type AbandonedCartStats = {
  activeCount: number;
  completedCount: number;
  expiredCount: number;
  totalTracked: number;
  recoveryRate: number;
  staleCount: number;
  reminderSummary: AbandonedCartStat[];
};

export type ShippingRate = {
  _id: string;
  name: string;
  scope: "domestic" | "international" | "both";
  method: "standard" | "express" | "white-glove";
  rateType: "flat" | "conditional" | "weight" | "free";
  price: number;
  freeAbove: number;
  belowPrice: number;
  pricePerKg: number;
  basePrice: number;
  eta: string;
  active: boolean;
  sortOrder: number;
  createdAt: string;
};
