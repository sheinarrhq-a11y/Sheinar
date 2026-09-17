import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { motion } from "framer-motion";

export const Route = createFileRoute("/track/$trackingNumber")({
  component: TrackDetailPage,
});

function TrackDetailPage({ params }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/track/${encodeURIComponent(params.trackingNumber)}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Load failed");
        setData(json);
      } catch (err) {
        setError(err.message || "Unable to load tracking details.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.trackingNumber]);

  return (
    <SiteLayout>
      <div className="pt-32 px-6 lg:px-12 max-w-5xl mx-auto pb-24">
        {loading ? (
          <div className="text-center py-24 text-neutral-500">Loading shipment details…</div>
        ) : error ? (
          <div className="text-center py-24 text-red-500">{error}</div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-10">
              <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">Tracking Details</p>
              <h1 className="font-serif text-4xl mt-4">{data.order.orderNumber}</h1>
              <p className="mt-3 text-neutral-500">Carrier: {data.shipment.carrier} · Tracking #{data.shipment.trackingNumber}</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 mb-10">
              <div className="bg-white border border-neutral-200 p-6 rounded-xl shadow-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-4">Current status</p>
                <p className="text-2xl font-medium mb-2">{data.shipment.currentStatus.replace(/-/g, " ")}</p>
                <p className="text-sm text-neutral-500">Latest location: {data.shipment.currentLocation}</p>
                <p className="text-sm text-neutral-500 mt-2">Estimated delivery: {data.shipment.estimatedDeliveryDate ? new Date(data.shipment.estimatedDeliveryDate).toLocaleDateString() : "TBD"}</p>
              </div>
              <div className="bg-white border border-neutral-200 p-6 rounded-xl shadow-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 mb-4">Shipment progress</p>
                <div className="h-3 bg-neutral-200 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-[#b08d57] rounded-full" style={{ width: `${data.shipment.progressPercent}%` }} />
                </div>
                <p className="text-sm text-neutral-500">{data.shipment.progressPercent}% complete</p>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-[#f9f6f0] px-6 py-5 border-b border-neutral-200">
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Shipment history</p>
              </div>
              <div className="divide-y divide-neutral-200">
                {data.shipment.events.map((event, index) => (
                  <div key={index} className="px-6 py-5">
                    <p className="text-sm font-medium">{event.status.replace(/-/g, " ")}</p>
                    <p className="text-sm text-neutral-500">{event.detail}</p>
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
