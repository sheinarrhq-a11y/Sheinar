import { useState, useEffect, useCallback } from "react";
import { getBookings, updateBookingStatus, deleteBooking, getAbandonedCartStats, getAbandonedCarts, type Booking, type AbandonedCartStats, type AbandonedCheckoutItem } from "./api";
import { RefreshCw, Trash2, ChevronLeft, ChevronRight, LogOut, Calendar, Package, LayoutGrid, Truck, ShoppingBag, Mail, Repeat, Menu, X, MessageSquare } from "lucide-react";
import ProductsTab from "./ProductsTab";
import CollectionsTab from "./CollectionsTab";
import ShippingTab from "./ShippingTab";
import OrdersTab from "./OrdersTab";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  confirmed: "bg-green-500/15 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/30",
};
const FILTERS = ["all", "pending", "confirmed", "cancelled"] as const;

export default function Dashboard({ username, onLogout }: { username: string; onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<"bookings" | "products" | "collections" | "shipping" | "orders" | "abandoned">("bookings");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  function selectTab(tab: typeof activeTab) {
    setActiveTab(tab);
    setMobileNavOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Top bar */}
      <header className="bg-[#1a1a1a] border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setMobileNavOpen(true)} className="lg:hidden text-neutral-300 hover:text-[#b08d57] transition-colors" aria-label="Open admin navigation">
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg tracking-[0.35em] font-light text-white">SHEINAR</h1>
          <span className="text-neutral-600 text-xs tracking-[2px] uppercase">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-neutral-400 text-xs tracking-wide hidden sm:block">{username}</span>
          <button onClick={onLogout} className="flex items-center gap-2 text-neutral-400 hover:text-white text-xs tracking-[2px] uppercase transition-colors">
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Nav tabs */}
        <div className="hidden lg:flex gap-0 border-b border-neutral-800 mb-8">
          <button
            onClick={() => selectTab("bookings")}
            className={`flex items-center gap-2 px-5 py-3 text-[11px] tracking-[2px] uppercase border-b-2 transition-colors ${activeTab === "bookings" ? "border-[#b08d57] text-[#b08d57]" : "border-transparent text-neutral-500 hover:text-neutral-300"}`}
          >
            <Calendar className="h-3.5 w-3.5" /> Bookings
          </button>
          <button
            onClick={() => selectTab("products")}
            className={`flex items-center gap-2 px-5 py-3 text-[11px] tracking-[2px] uppercase border-b-2 transition-colors ${activeTab === "products" ? "border-[#b08d57] text-[#b08d57]" : "border-transparent text-neutral-500 hover:text-neutral-300"}`}
          >
            <Package className="h-3.5 w-3.5" /> Products
          </button>
          <button
            onClick={() => selectTab("collections")}
            className={`flex items-center gap-2 px-5 py-3 text-[11px] tracking-[2px] uppercase border-b-2 transition-colors ${activeTab === "collections" ? "border-[#b08d57] text-[#b08d57]" : "border-transparent text-neutral-500 hover:text-neutral-300"}`}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Collections
          </button>
          <button
            onClick={() => selectTab("shipping")}
            className={`flex items-center gap-2 px-5 py-3 text-[11px] tracking-[2px] uppercase border-b-2 transition-colors ${activeTab === "shipping" ? "border-[#b08d57] text-[#b08d57]" : "border-transparent text-neutral-500 hover:text-neutral-300"}`}
          >
            <Truck className="h-3.5 w-3.5" /> Shipping
          </button>
          <button
            onClick={() => selectTab("orders")}
            className={`flex items-center gap-2 px-5 py-3 text-[11px] tracking-[2px] uppercase border-b-2 transition-colors ${activeTab === "orders" ? "border-[#b08d57] text-[#b08d57]" : "border-transparent text-neutral-500 hover:text-neutral-300"}`}
          >
            <ShoppingBag className="h-3.5 w-3.5" /> Orders
          </button>
          <button
            onClick={() => selectTab("abandoned")}
            className={`flex items-center gap-2 px-5 py-3 text-[11px] tracking-[2px] uppercase border-b-2 transition-colors ${activeTab === "abandoned" ? "border-[#b08d57] text-[#b08d57]" : "border-transparent text-neutral-500 hover:text-neutral-300"}`}
          >
            <Repeat className="h-3.5 w-3.5" /> Abandoned
          </button>
        </div>

        {activeTab === "bookings" && <BookingsTab onUnauth={onLogout} />}
        {activeTab === "products" && <ProductsTab onUnauth={onLogout} />}
        {activeTab === "collections" && <CollectionsTab onUnauth={onLogout} />}
        {activeTab === "shipping" && <ShippingTab onUnauth={onLogout} />}
        {activeTab === "orders" && <OrdersTab onUnauth={onLogout} />}
        {activeTab === "abandoned" && <AbandonedCartTab onUnauth={onLogout} />}
      </div>

      {mobileNavOpen && (
        <>
          <button
            aria-label="Close admin navigation"
            onClick={() => setMobileNavOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-[min(82vw,320px)] border-r border-neutral-800 bg-[#151515] p-5 shadow-2xl lg:hidden">
            <div className="mb-8 flex items-center justify-between border-b border-neutral-800 pb-5">
              <span className="text-xs tracking-[3px] uppercase text-[#b08d57]">Admin Menu</span>
              <button onClick={() => setMobileNavOpen(false)} className="text-neutral-400 hover:text-white" aria-label="Close admin navigation">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {[
                ["bookings", "Bookings", Calendar],
                ["products", "Products", Package],
                ["collections", "Collections", LayoutGrid],
                ["shipping", "Shipping", Truck],
                ["orders", "Orders", ShoppingBag],
                ["abandoned", "Abandoned", Repeat],
              ].map(([value, label, Icon]) => (
                <button
                  key={value as string}
                  onClick={() => selectTab(value as typeof activeTab)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left text-[11px] tracking-[2px] uppercase transition-colors ${activeTab === value ? "bg-[#b08d57]/10 text-[#b08d57]" : "text-neutral-400 hover:bg-white/[0.04] hover:text-white"}`}
                >
                  <Icon className="h-4 w-4" />
                  {label as string}
                </button>
              ))}
            </nav>
          </aside>
        </>
      )}
    </div>
  );
}

function BookingsTab({ onUnauth }: { onUnauth: () => void }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<typeof FILTERS[number]>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await getBookings({ status: filter === "all" ? undefined : filter, page });
      setBookings(data.bookings); setTotal(data.total); setPages(data.pages);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "UNAUTHORIZED") onUnauth();
      else setError("Failed to load bookings.");
    } finally { setLoading(false); }
  }, [filter, page, onUnauth]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  async function handleStatusChange(id: string, status: string) {
    setUpdating(id);
    try {
      await updateBookingStatus(id, status);
      setBookings((prev) => prev.map((b) => b._id === id ? { ...b, status: status as Booking["status"] } : b));
    } finally { setUpdating(null); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this booking?")) return;
    setUpdating(id);
    try { await deleteBooking(id); setBookings((p) => p.filter((b) => b._id !== id)); setTotal((t) => t - 1); }
    finally { setUpdating(null); }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm tracking-[2px] uppercase text-white">Bookings</span>
          <span className="bg-[#b08d57]/20 text-[#b08d57] text-xs px-2 py-0.5 rounded-full">{total}</span>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }}
              className={`text-[11px] tracking-[2px] uppercase px-4 py-2 border transition-colors ${filter === f ? "border-[#b08d57] text-[#b08d57] bg-[#b08d57]/10" : "border-neutral-700 text-neutral-400 hover:border-neutral-500"}`}>
              {f}
            </button>
          ))}
          <button onClick={fetchBookings} className="text-neutral-400 hover:text-white transition-colors ml-1">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <div className="bg-[#1a1a1a] border border-neutral-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24"><RefreshCw className="h-5 w-5 text-[#b08d57] animate-spin" /></div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-24 text-neutral-500 text-sm">No bookings found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-left">
                  {["Name", "Email", "Phone", "Store", "Date", "Time", "Received", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-[10px] tracking-[2px] uppercase text-neutral-500 font-normal whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id} className="border-b border-neutral-800/50 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-white font-medium whitespace-nowrap">{b.name}</td>
                    <td className="px-4 py-3 text-neutral-300 whitespace-nowrap">{b.email}</td>
                    <td className="px-4 py-3 text-neutral-400 whitespace-nowrap">{b.phone || "—"}</td>
                    <td className="px-4 py-3 text-neutral-300 whitespace-nowrap">{b.store}</td>
                    <td className="px-4 py-3 text-neutral-300 whitespace-nowrap">{b.date}</td>
                    <td className="px-4 py-3 text-neutral-300 whitespace-nowrap">{b.time}</td>
                    <td className="px-4 py-3 text-neutral-500 whitespace-nowrap text-xs">
                      {new Date(b.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-[10px] tracking-[1.5px] uppercase px-2.5 py-1 border rounded-full ${STATUS_COLORS[b.status]}`}>{b.status}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <select value={b.status} disabled={updating === b._id} onChange={(e) => handleStatusChange(b._id, e.target.value)}
                          className="bg-[#0f0f0f] border border-neutral-700 text-neutral-300 text-xs px-2 py-1.5 focus:outline-none focus:border-[#b08d57] transition-colors disabled:opacity-40">
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button onClick={() => handleDelete(b._id)} disabled={updating === b._id} className="text-neutral-600 hover:text-red-400 transition-colors disabled:opacity-40">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-neutral-500 text-xs">Page {page} of {pages} · {total} total</span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 border border-neutral-700 text-neutral-400 hover:border-neutral-500 disabled:opacity-30 transition-colors"><ChevronLeft className="h-4 w-4" /></button>
            <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="p-2 border border-neutral-700 text-neutral-400 hover:border-neutral-500 disabled:opacity-30 transition-colors"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
}

function AbandonedCartTab({ onUnauth }: { onUnauth: () => void }) {
  const [stats, setStats] = useState<AbandonedCartStats | null>(null);
  const [carts, setCarts] = useState<AbandonedCheckoutItem[]>([]);
  const [cartPage, setCartPage] = useState(1);
  const [cartStatusFilter, setCartStatusFilter] = useState<"all" | "active" | "completed" | "expired">("all");
  const [loading, setLoading] = useState(true);
  const [loadingCarts, setLoadingCarts] = useState(false);
  const [error, setError] = useState("");
  const [cartError, setCartError] = useState("");
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAbandonedCartStats();
      setStats(data);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "UNAUTHORIZED") return onUnauth();
      setError("Failed to load abandoned cart metrics.");
    } finally {
      setLoading(false);
    }
  }, [onUnauth]);

  const fetchCarts = useCallback(async () => {
    setLoadingCarts(true);
    setCartError("");
    try {
      const data = await getAbandonedCarts({ status: cartStatusFilter === "all" ? undefined : cartStatusFilter, page: cartPage, limit: 15 });
      setCarts(data.items);
      setPages(data.pages);
      setTotal(data.total);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "UNAUTHORIZED") return onUnauth();
      setCartError("Failed to load abandoned carts list.");
    } finally {
      setLoadingCarts(false);
    }
  }, [cartPage, cartStatusFilter, onUnauth]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchCarts(); }, [fetchCarts]);

  const emailCount = stats?.reminderSummary.find((item) => item._id === "email")?.total ?? 0;
  const whatsappCount = stats?.reminderSummary.find((item) => item._id === "whatsapp")?.total ?? 0;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm tracking-[2px] uppercase text-white">Abandoned Carts</span>
          <span className="bg-[#b08d57]/20 text-[#b08d57] text-xs px-2 py-0.5 rounded-full">{stats ? stats.totalTracked : "—"}</span>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <button onClick={fetchStats}
            className="text-neutral-400 hover:text-white transition-colors flex items-center gap-2 text-[11px] uppercase tracking-[2px]"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="p-5 border border-neutral-800 bg-[#0f0f0f]">
          <div className="flex items-center gap-3 text-neutral-300 mb-3">
            <Mail className="h-4 w-4 text-[#b08d57]" />
            <p className="text-xs uppercase tracking-[2px] text-neutral-500">Emails sent</p>
          </div>
          <p className="text-4xl font-semibold text-white">{emailCount}</p>
          <p className="mt-2 text-xs text-neutral-500">Total abandoned cart reminder emails sent</p>
        </div>
        <div className="p-5 border border-neutral-800 bg-[#0f0f0f]">
          <div className="flex items-center gap-3 text-neutral-300 mb-3">
            <MessageSquare className="h-4 w-4 text-[#b08d57]" />
            <p className="text-xs uppercase tracking-[2px] text-neutral-500">WhatsApp sent</p>
          </div>
          <p className="text-4xl font-semibold text-white">{whatsappCount}</p>
          <p className="mt-2 text-xs text-neutral-500">Total WhatsApp reminder messages sent</p>
        </div>
        <div className="p-5 border border-neutral-800 bg-[#0f0f0f]">
          <div className="flex items-center gap-3 text-neutral-300 mb-3">
            <Repeat className="h-4 w-4 text-[#b08d57]" />
            <p className="text-xs uppercase tracking-[2px] text-neutral-500">Stale carts</p>
          </div>
          <p className="text-4xl font-semibold text-white">{stats?.staleCount ?? "—"}</p>
          <p className="mt-2 text-xs text-neutral-500">Active carts that are past expiration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 border border-neutral-800 bg-[#0f0f0f]">
          <p className="text-xs uppercase tracking-[2px] text-neutral-500 mb-3">Abandoned cart lifecycle</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-[#1a1a1a] p-4">
              <p className="text-3xl font-semibold text-white">{stats?.activeCount ?? "—"}</p>
              <p className="text-[11px] tracking-[2px] uppercase text-neutral-500 mt-2">Active</p>
            </div>
            <div className="bg-[#1a1a1a] p-4">
              <p className="text-3xl font-semibold text-white">{stats?.completedCount ?? "—"}</p>
              <p className="text-[11px] tracking-[2px] uppercase text-neutral-500 mt-2">Recovered</p>
            </div>
            <div className="bg-[#1a1a1a] p-4">
              <p className="text-3xl font-semibold text-white">{stats?.expiredCount ?? "—"}</p>
              <p className="text-[11px] tracking-[2px] uppercase text-neutral-500 mt-2">Expired</p>
            </div>
          </div>
        </div>

        <div className="p-5 border border-neutral-800 bg-[#0f0f0f]">
          <p className="text-xs uppercase tracking-[2px] text-neutral-500 mb-3">Recovery rate</p>
          <p className="text-5xl font-semibold text-white">{stats?.recoveryRate ?? "—"}%</p>
          <p className="mt-2 text-xs text-neutral-500">Recovered carts / tracked carts</p>
        </div>
      </div>

      <div className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-sm tracking-[2px] uppercase text-neutral-400">Abandoned Cart Records</h2>
            <p className="text-xs text-neutral-500">Showing saved carts and their current status.</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {(["all", "active", "completed", "expired"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => { setCartStatusFilter(filter); setCartPage(1); }}
                className={`text-[11px] uppercase tracking-[2px] px-3 py-2 border transition-colors ${cartStatusFilter === filter ? "border-[#b08d57] text-[#b08d57] bg-[#b08d57]/10" : "border-neutral-700 text-neutral-400 hover:border-neutral-500"}`}
              >
                {filter}
              </button>
            ))}
            <button onClick={() => { fetchCarts(); fetchStats(); }} className="text-neutral-400 hover:text-white transition-colors flex items-center gap-2 text-[11px] uppercase tracking-[2px]">
              <RefreshCw className={`h-3.5 w-3.5 ${loadingCarts ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
        </div>

        {cartError && <p className="text-red-400 text-sm mb-4">{cartError}</p>}

        <div className="bg-[#1a1a1a] border border-neutral-800 overflow-hidden">
          {loadingCarts ? (
            <div className="flex items-center justify-center py-24"><RefreshCw className="h-5 w-5 text-[#b08d57] animate-spin" /></div>
          ) : carts.length === 0 ? (
            <div className="text-center py-24 text-neutral-500 text-sm">No abandoned carts found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-800 text-left">
                    {['Customer', 'Email', 'Phone', 'Status', 'Amount', 'Reminders', 'Started', 'Completed'].map((h) => (
                      <th key={h} className="px-4 py-3 text-[10px] tracking-[2px] uppercase text-neutral-500 font-normal whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {carts.map((cart) => (
                    <tr key={cart._id} className="border-b border-neutral-800/50 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-white font-medium whitespace-nowrap">{cart.customerName}</td>
                      <td className="px-4 py-3 text-neutral-300 whitespace-nowrap">{cart.email}</td>
                      <td className="px-4 py-3 text-neutral-400 whitespace-nowrap">{cart.phone}</td>
                      <td className="px-4 py-3 whitespace-nowrap"><span className={`text-[10px] tracking-[1.5px] uppercase px-2.5 py-1 border rounded-full ${cart.status === 'active' ? 'border-blue-500 text-blue-400' : cart.status === 'completed' ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'}`}>{cart.status}</span></td>
                      <td className="px-4 py-3 text-neutral-300 whitespace-nowrap">{cart.currency} {cart.totalAmount.toFixed(2)}</td>
                      <td className="px-4 py-3 text-neutral-300 whitespace-nowrap">{cart.reminderCount}</td>
                      <td className="px-4 py-3 text-neutral-300 whitespace-nowrap">{new Date(cart.checkoutStartedAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-neutral-300 whitespace-nowrap">{cart.completedAt ? new Date(cart.completedAt).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <span className="text-neutral-500 text-xs">Page {cartPage} of {pages} · {total} total</span>
            <div className="flex gap-2">
              <button onClick={() => setCartPage((p) => Math.max(1, p - 1))} disabled={cartPage === 1} className="p-2 border border-neutral-700 text-neutral-400 hover:border-neutral-500 disabled:opacity-30 transition-colors"><ChevronLeft className="h-4 w-4" /></button>
              <button onClick={() => setCartPage((p) => Math.min(pages, p + 1))} disabled={cartPage === pages} className="p-2 border border-neutral-700 text-neutral-400 hover:border-neutral-500 disabled:opacity-30 transition-colors"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
