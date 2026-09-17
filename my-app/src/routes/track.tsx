import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { motion } from "framer-motion";

export const Route = createFileRoute("/track")({
  component: TrackPage,
});

function TrackPage() {
  const [query, setQuery] = useState("");
  const [method, setMethod] = useState("trackingNumber");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    if (!query.trim()) {
      setError("Enter a tracking number, order number or order email.");
      return;
    }
    setError("");
    if (method === "trackingNumber") {
      navigate({ to: "/track/" + encodeURIComponent(query.trim()) });
      return;
    }
    if (method === "orderNumber") {
      navigate({ to: "/order-status/" + encodeURIComponent(query.trim()) });
      return;
    }
    if (method === "email") {
      navigate({ to: "/track/" + encodeURIComponent(query.trim()) });
      return;
    }
  }

  return (
    <SiteLayout>
      <div className="pt-32 px-6 lg:px-12 max-w-3xl mx-auto pb-24">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">Shipment Tracking</p>
          <h1 className="font-serif text-5xl mt-4 mb-6">Track Your Order</h1>
          <p className="text-neutral-500 mb-10">Search using a tracking number, order number or customer email and find the latest delivery status instantly.</p>

          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-xs tracking-[0.3em] uppercase text-neutral-500">Lookup method</label>
              <select value={method} onChange={(e) => setMethod(e.target.value)} className="border border-neutral-300 rounded-md px-4 py-3 text-sm bg-white">
                <option value="trackingNumber">Tracking Number</option>
                <option value="orderNumber">Order Number</option>
                <option value="email">Email + Order Number</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-xs tracking-[0.3em] uppercase text-neutral-500">Search</label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter tracking number or order number"
                className="border border-neutral-300 rounded-md px-4 py-3 text-sm"
              />
            </div>
            <button type="submit" className="w-full bg-[#b08d57] text-white uppercase tracking-[0.3em] py-3 rounded-md text-sm">Search</button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </form>
        </motion.div>
      </div>
    </SiteLayout>
  );
}
