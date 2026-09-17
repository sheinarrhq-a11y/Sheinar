import { useState, useEffect, useCallback } from "react";
import { RefreshCw, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Truck, X } from "lucide-react";
import { getOrders, updateOrderStatus, createShipment, cancelShipment, getCarriers, type AdminOrder } from "./api";

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  confirmed:  "bg-blue-500/15 text-blue-400 border-blue-500/30",
  processing: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  shipped:    "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  delivered:  "bg-green-500/15 text-green-400 border-green-500/30",
  cancelled:  "bg-red-500/15 text-red-400 border-red-500/30",
};

const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"] as const;
const FILTERS = ["all", ...ORDER_STATUSES] as const;

const fmt = (n: number, c = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(n);

export default function OrdersTab({ onUnauth }: { onUnauth: () => void }) {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<typeof FILTERS[number]>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [shipmentModal, setShipmentModal] = useState<string | null>(null);
  const [selectedCarrier, setSelectedCarrier] = useState("Delhivery");
  const [carriers, setCarriers] = useState<string[]>([]);
  const [creatingShipment, setCreatingShipment] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await getOrders({ status: filter === "all" ? undefined : filter, page });
      setOrders(data.orders); setTotal(data.total); setPages(data.pages);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "UNAUTHORIZED") onUnauth();
      else setError("Failed to load orders.");
    } finally { setLoading(false); }
  }, [filter, page, onUnauth]);

  useEffect(() => { 
    fetchOrders();
    getCarriers().then(c => setCarriers(c)).catch(() => {});
  }, [fetchOrders]);

  async function handleStatusChange(id: string, status: string) {
    setUpdating(id);
    try {
      await updateOrderStatus(id, status);
      setOrders((prev) => prev.map((o) => o._id === id ? { ...o, status: status as AdminOrder["status"] } : o));
    } finally { setUpdating(null); }
  }

  async function handleCreateShipment(orderId: string) {
    setCreatingShipment(true);
    try {
      const result = await createShipment(orderId, selectedCarrier);
      setOrders((prev) => prev.map((o) => o._id === orderId ? result.order : o));
      setShipmentModal(null);
      setError("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create shipment");
    } finally { setCreatingShipment(false); }
  }

  async function handleCancelShipment(orderId: string) {
    if (!confirm("Cancel this shipment?")) return;
    try {
      const result = await cancelShipment(orderId);
      setOrders((prev) => prev.map((o) => o._id === orderId ? result.order : o));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to cancel shipment");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm tracking-[2px] uppercase text-white">Orders</span>
          <span className="bg-[#b08d57]/20 text-[#b08d57] text-xs px-2 py-0.5 rounded-full">{total}</span>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }}
              className={`text-[11px] tracking-[2px] uppercase px-3 py-1.5 border transition-colors ${filter === f ? "border-[#b08d57] text-[#b08d57] bg-[#b08d57]/10" : "border-neutral-700 text-neutral-400 hover:border-neutral-500"}`}>
              {f}
            </button>
          ))}
          <button onClick={fetchOrders} className="text-neutral-400 hover:text-white transition-colors ml-1">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <div className="bg-[#1a1a1a] border border-neutral-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24"><RefreshCw className="h-5 w-5 text-[#b08d57] animate-spin" /></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24 text-neutral-500 text-sm">No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-left">
                  {["", "Order #", "Customer", "Items", "Total", "Payment", "Date", "Status", "Shipment", "Update"].map((h) => (
                    <th key={h} className="px-4 py-3 text-[10px] tracking-[2px] uppercase text-neutral-500 font-normal whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <>
                    <tr key={o._id} className="border-b border-neutral-800/50 hover:bg-white/[0.02] transition-colors">
                      <td className="px-3 py-3">
                        <button onClick={() => setExpanded(expanded === o._id ? null : o._id)} className="text-neutral-500 hover:text-white transition-colors">
                          {expanded === o._id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-[#b08d57] font-mono text-xs whitespace-nowrap">{o.orderNumber}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-white font-medium">{o.customer.firstName} {o.customer.lastName}</p>
                        <p className="text-neutral-500 text-xs">{o.customer.email}</p>
                      </td>
                      <td className="px-4 py-3 text-neutral-300 whitespace-nowrap">{o.items.length} piece{o.items.length !== 1 ? "s" : ""}</td>
                      <td className="px-4 py-3 text-white whitespace-nowrap font-medium">{fmt(o.total, o.currency)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-[10px] tracking-[1.5px] uppercase px-2 py-0.5 border rounded-full ${o.paymentStatus === "paid" ? "bg-green-500/15 text-green-400 border-green-500/30" : "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"}`}>
                          {o.paymentStatus} · {o.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-500 text-xs whitespace-nowrap">
                        {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-[10px] tracking-[1.5px] uppercase px-2.5 py-1 border rounded-full ${STATUS_COLORS[o.status]}`}>{o.status}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {o.trackingNumber ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-green-400 font-mono">{o.trackingNumber}</span>
                            <button onClick={() => handleCancelShipment(o._id)} className="text-neutral-500 hover:text-red-400 transition-colors text-xs">Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => setShipmentModal(o._id)} className="flex items-center gap-1.5 text-[10px] tracking-[1px] uppercase px-2 py-1 border border-neutral-700 text-neutral-400 hover:border-[#b08d57] hover:text-[#b08d57] transition-colors">
                            <Truck className="h-3 w-3" /> Create
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <select value={o.status} disabled={updating === o._id}
                          onChange={(e) => handleStatusChange(o._id, e.target.value)}
                          className="bg-[#0f0f0f] border border-neutral-700 text-neutral-300 text-xs px-2 py-1.5 focus:outline-none focus:border-[#b08d57] transition-colors disabled:opacity-40">
                          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                      </td>
                    </tr>
                    {expanded === o._id && (
                      <tr key={`${o._id}-detail`} className="border-b border-neutral-800 bg-[#111]">
                        <td colSpan={10} className="px-6 py-5">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                            {/* Items */}
                            <div>
                              <p className="text-[10px] tracking-[2px] uppercase text-neutral-500 mb-3">Items</p>
                              <div className="space-y-3">
                                {o.items.map((item, i) => (
                                  <div key={i} className="flex gap-3 items-start">
                                    {item.image && <img src={item.image} alt={item.title} className="w-12 h-14 object-cover shrink-0 opacity-80" />}
                                    <div>
                                      <p className="text-white">{item.title}</p>
                                      <p className="text-neutral-500">{item.collection}{item.size ? ` · Size ${item.size}` : ""}</p>
                                      <p className="text-neutral-400">{fmt(item.price)} × {item.qty}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            {/* Shipping */}
                            <div>
                              <p className="text-[10px] tracking-[2px] uppercase text-neutral-500 mb-3">Shipping Address</p>
                              <p className="text-neutral-300 leading-relaxed">
                                {o.shippingAddress.address}{o.shippingAddress.apt ? `, ${o.shippingAddress.apt}` : ""}<br />
                                {o.shippingAddress.city}, {o.shippingAddress.state} {o.shippingAddress.pin}<br />
                                {o.shippingAddress.country}
                              </p>
                              {o.customer.phone && <p className="text-neutral-500 mt-2">{o.customer.phone}</p>}
                              <p className="text-neutral-500 mt-2">Method: {o.shippingMethod}</p>
                            </div>
                            {/* Summary */}
                            <div>
                              <p className="text-[10px] tracking-[2px] uppercase text-neutral-500 mb-3">Order Summary</p>
                              <div className="space-y-1.5 text-neutral-400">
                                <div className="flex justify-between"><span>Subtotal</span><span>{fmt(o.subtotal, o.currency)}</span></div>
                                <div className="flex justify-between"><span>Shipping</span><span>{o.shippingCost === 0 ? "Free" : fmt(o.shippingCost, o.currency)}</span></div>
                                <div className="flex justify-between"><span>Tax</span><span>{fmt(o.tax, o.currency)}</span></div>
                                <div className="flex justify-between text-white font-medium border-t border-neutral-700 pt-1.5 mt-1.5"><span>Total</span><span>{fmt(o.total, o.currency)}</span></div>
                              </div>
                              {o.razorpayOrderId && <p className="text-neutral-600 mt-3 font-mono text-[10px] break-all">RZP: {o.razorpayOrderId}</p>}
                            </div>
                          </div>
                          {/* Shipment Info */}
                          <div className="mt-6 pt-6 border-t border-neutral-800">
                            <p className="text-[10px] tracking-[2px] uppercase text-neutral-500 mb-3 flex items-center gap-2"><Truck className="h-3.5 w-3.5" /> Shipment</p>
                            {o.trackingNumber ? (
                              <div className="space-y-2 text-sm">
                                <div className="grid grid-cols-2 gap-2">
                                  <div><p className="text-neutral-500 text-xs">Carrier</p><p className="text-white">{o.carrier}</p></div>
                                  <div><p className="text-neutral-500 text-xs">Provider</p><p className="text-white">{o.logisticsProvider}</p></div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div><p className="text-neutral-500 text-xs">Tracking #</p><p className="text-[#b08d57] font-mono">{o.trackingNumber}</p></div>
                                  {o.estimatedDeliveryDate && <div><p className="text-neutral-500 text-xs">Est. Delivery</p><p className="text-white">{new Date(o.estimatedDeliveryDate).toLocaleDateString("en-IN")}</p></div>}
                                </div>
                                <button onClick={() => handleCancelShipment(o._id)} className="mt-2 text-xs px-2 py-1 border border-red-500/30 text-red-400 hover:border-red-500/60 transition-colors">Cancel Shipment</button>
                              </div>
                            ) : (
                              <button onClick={() => setShipmentModal(o._id)} className="text-xs px-3 py-2 border border-[#b08d57]/30 text-[#b08d57] hover:border-[#b08d57]/60 transition-colors flex items-center gap-2">
                                <Truck className="h-3 w-3" /> Create Shipment
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
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

      {/* Shipment Modal */}
      {shipmentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border border-neutral-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-[#b08d57]" />
                <h3 className="text-lg text-white font-medium">Create Shipment</h3>
              </div>
              <button onClick={() => setShipmentModal(null)} className="text-neutral-500 hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs tracking-[2px] uppercase text-neutral-500 block mb-2">Select Logistics Partner</label>
                <select value={selectedCarrier} onChange={(e) => setSelectedCarrier(e.target.value)} className="w-full bg-[#0f0f0f] border border-neutral-700 text-neutral-300 text-sm px-3 py-2 focus:outline-none focus:border-[#b08d57] transition-colors">
                  {carriers.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <p className="text-xs text-neutral-500">
                Order will be assigned to <span className="text-[#b08d57] font-medium">{selectedCarrier}</span> for shipment.
              </p>

              <div className="flex gap-2 pt-4">
                <button onClick={() => setShipmentModal(null)} className="flex-1 px-3 py-2 border border-neutral-700 text-neutral-400 hover:border-neutral-500 text-sm transition-colors">
                  Cancel
                </button>
                <button onClick={() => handleCreateShipment(shipmentModal)} disabled={creatingShipment} className="flex-1 px-3 py-2 bg-[#b08d57] text-black hover:bg-[#c9a66d] disabled:opacity-50 text-sm font-medium transition-colors">
                  {creatingShipment ? "Creating..." : "Create Shipment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
