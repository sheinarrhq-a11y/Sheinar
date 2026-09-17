import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { motion } from "framer-motion";

export const Route = createFileRoute("/order-status/$orderNumber")({
  component: OrderStatusPage,
});

function OrderStatusPage({ params }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/order-status/${encodeURIComponent(params.orderNumber)}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Load failed");
        setData(json);
      } catch (err) {
        setError(err.message || "Unable to load order status.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.orderNumber]);

  return (
    <SiteLayout>
      <div className="pt-32 px-6 lg:px-12 max-w-5xl mx-auto pb-24">
        {loading ? (
          <div className="text-center py-24 text-neutral-500">Loading order status…</div>
        ) : error ? (
          <div className="text-center py-24 text-red-500">{error}</div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-10">
              <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">Order Status</p>
              <h1 className="font-serif text-4xl mt-4">{data.order.orderNumber}</h1>
              <p className="mt-3 text-neutral-500">Current status: {data.order.status.replace(/-/g, " ")}</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 mb-10">
              <div className="bg-white border border-neutral-200 p-6 rounded-xl shadow-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-4">Shipment</p>
                <p className="text-sm text-neutral-800">Carrier: {data.order.carrier}</p>
                <p className="text-sm text-neutral-800">Tracking number: {data.order.trackingNumber || "N/A"}</p>
                <p className="text-sm text-neutral-800">Estimated delivery: {data.order.estimatedDeliveryDate ? new Date(data.order.estimatedDeliveryDate).toLocaleDateString() : "TBD"}</p>
                <p className="text-sm text-neutral-500 mt-3">Shipping to: {data.order.shippingAddress.address}, {data.order.shippingAddress.city}, {data.order.shippingAddress.state}</p>
              </div>
              <div className="bg-white border border-neutral-200 p-6 rounded-xl shadow-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-4">Customer</p>
                <p className="text-sm text-neutral-800">{data.order.customer.firstName} {data.order.customer.lastName}</p>
                <p className="text-sm text-neutral-800">{data.order.customer.email}</p>
                <p className="text-sm text-neutral-800">{data.order.customer.phone || "—"}</p>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-[#f9f6f0] px-6 py-5 border-b border-neutral-200">
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Order timeline</p>
              </div>
              <div className="divide-y divide-neutral-200">
                {data.order.trackingHistory?.map((event, index) => (
                  <div key={index} className="px-6 py-5">
                    <p className="text-sm font-medium">{event.status.replace(/-/g, " ")}</p>
                    <p className="text-sm text-neutral-500">{event.description || "Status updated."}</p>
                    <p className="text-xs uppercase tracking-[0.3em] text-neutral-400 mt-2">{event.location} · {new Date(event.timestamp).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </SiteLayout>
  );
}
