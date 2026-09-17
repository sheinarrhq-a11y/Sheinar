import { useState, useEffect, useCallback } from "react";
import {
  getShippingRates, createShippingRate, updateShippingRate,
  deleteShippingRate, seedShippingRates, type ShippingRate,
} from "./api";
import { Plus, Pencil, Trash2, RefreshCw, Truck, ToggleLeft, ToggleRight, Database } from "lucide-react";

const RATE_TYPE_LABELS: Record<string, string> = {
  flat: "Flat Rate", conditional: "Conditional (Free above)", weight: "Weight-Based", free: "Free",
};
const RATE_TYPE_COLORS: Record<string, string> = {
  flat: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  conditional: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  weight: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  free: "bg-green-500/15 text-green-400 border-green-500/30",
};
const SCOPE_LABELS: Record<string, string> = { domestic: "🇮🇳 Domestic", international: "🌍 International", both: "🌐 Both" };

const EMPTY: Omit<ShippingRate, "_id" | "createdAt"> = {
  name: "", scope: "domestic", method: "standard", rateType: "flat",
  price: 0, freeAbove: 0, belowPrice: 0,
  pricePerKg: 0, basePrice: 0,
  eta: "", active: true, sortOrder: 0,
};

const inp = "w-full bg-[#0f0f0f] border border-neutral-700 text-white text-sm px-3 py-2 focus:outline-none focus:border-[#b08d57] transition-colors";
const lbl = "block text-[10px] tracking-[2px] uppercase text-neutral-500 mb-1.5";
const sel = `${inp} cursor-pointer`;

export default function ShippingTab({ onUnauth }: { onUnauth: () => void }) {
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ShippingRate | null>(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await getShippingRates();
      setRates(data);
    } catch (e: unknown) {
      if (e instanceof Error && e.message === "UNAUTHORIZED") onUnauth();
      else setError("Failed to load rates.");
    } finally { setLoading(false); }
  }, [onUnauth]);

  useEffect(() => { load(); }, [load]);

  function openNew() { setForm({ ...EMPTY }); setEditing(null); setShowForm(true); }
  function openEdit(r: ShippingRate) { setForm({ ...r }); setEditing(r); setShowForm(true); }
  function cancel() { setShowForm(false); setEditing(null); }

  async function handleSave() {
    if (!form.name.trim()) return setError("Name is required.");
    setSaving(true); setError("");
    try {
      if (editing) {
        const updated = await updateShippingRate(editing._id, form);
        setRates((p) => p.map((r) => r._id === editing._id ? updated : r));
      } else {
        const created = await createShippingRate(form);
        setRates((p) => [...p, created]);
      }
      cancel();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this shipping rate?")) return;
    try {
      await deleteShippingRate(id);
      setRates((p) => p.filter((r) => r._id !== id));
    } catch { setError("Delete failed."); }
  }

  async function handleToggle(r: ShippingRate) {
    try {
      const updated = await updateShippingRate(r._id, { active: !r.active });
      setRates((p) => p.map((x) => x._id === r._id ? updated : x));
    } catch { setError("Toggle failed."); }
  }

  async function handleSeed() {
    if (!confirm("This will replace ALL shipping rates with defaults. Continue?")) return;
    setSeeding(true);
    try { await seedShippingRates(); await load(); }
    catch { setError("Seed failed."); }
    finally { setSeeding(false); }
  }

  function f(key: keyof typeof form, val: unknown) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  function calcPreview() {
    if (form.rateType === "free") return "₹0 — Always Free";
    if (form.rateType === "flat") return `₹${form.price} flat`;
    if (form.rateType === "conditional")
      return form.freeAbove > 0
        ? `₹${form.belowPrice} below ₹${form.freeAbove} · Free above`
        : `₹${form.belowPrice} always`;
    if (form.rateType === "weight")
      return `₹${form.basePrice} base + ₹${form.pricePerKg}/kg × product weight`;
    return "";
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Truck className="h-4 w-4 text-[#b08d57]" />
          <span className="text-sm tracking-[2px] uppercase text-white">Shipping Rates</span>
          <span className="bg-[#b08d57]/20 text-[#b08d57] text-xs px-2 py-0.5 rounded-full">{rates.length}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSeed} disabled={seeding}
            className="flex items-center gap-2 text-[11px] tracking-[2px] uppercase px-4 py-2 border border-neutral-700 text-neutral-400 hover:border-neutral-500 transition-colors disabled:opacity-40">
            <Database className="h-3.5 w-3.5" /> {seeding ? "Seeding…" : "Seed Defaults"}
          </button>
          <button onClick={load} className="text-neutral-400 hover:text-white transition-colors p-2 border border-neutral-700">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={openNew}
            className="flex items-center gap-2 text-[11px] tracking-[2px] uppercase px-4 py-2 bg-[#b08d57] text-black hover:bg-[#c9a96e] transition-colors">
            <Plus className="h-3.5 w-3.5" /> Add Rate
          </button>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/20 px-4 py-2">{error}</p>}

      {/* Form */}
      {showForm && (
        <div className="bg-[#1a1a1a] border border-neutral-700 p-6 mb-6">
          <h3 className="text-sm tracking-[2px] uppercase text-white mb-6">
            {editing ? "Edit Rate" : "New Shipping Rate"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Name */}
            <div className="lg:col-span-2">
              <label className={lbl}>Rate Name</label>
              <input className={inp} placeholder="e.g. Standard Domestic" value={form.name}
                onChange={(e) => f("name", e.target.value)} />
            </div>

            {/* Sort Order */}
            <div>
              <label className={lbl}>Sort Order</label>
              <input type="number" className={inp} value={form.sortOrder}
                onChange={(e) => f("sortOrder", Number(e.target.value))} />
            </div>

            {/* Scope */}
            <div>
              <label className={lbl}>Scope</label>
              <select className={sel} value={form.scope} onChange={(e) => f("scope", e.target.value)}>
                <option value="domestic">🇮🇳 Domestic (India)</option>
                <option value="international">🌍 International</option>
                <option value="both">🌐 Both</option>
              </select>
            </div>

            {/* Method */}
            <div>
              <label className={lbl}>Delivery Method</label>
              <select className={sel} value={form.method} onChange={(e) => f("method", e.target.value)}>
                <option value="standard">Standard</option>
                <option value="express">Express</option>
                <option value="white-glove">White Glove</option>
              </select>
            </div>

            {/* Rate Type */}
            <div>
              <label className={lbl}>Rate Type</label>
              <select className={sel} value={form.rateType} onChange={(e) => f("rateType", e.target.value)}>
                <option value="flat">Flat Rate</option>
                <option value="conditional">Conditional (Free above amount)</option>
                <option value="weight">Weight-Based</option>
                <option value="free">Free Shipping</option>
              </select>
            </div>

            {/* ETA */}
            <div>
              <label className={lbl}>ETA / Delivery Time</label>
              <input className={inp} placeholder="e.g. 3–5 business days" value={form.eta}
                onChange={(e) => f("eta", e.target.value)} />
            </div>

            {/* Flat */}
            {form.rateType === "flat" && (
              <div>
                <label className={lbl}>Price (₹ INR)</label>
                <input type="number" className={inp} value={form.price}
                  onChange={(e) => f("price", Number(e.target.value))} />
              </div>
            )}

            {/* Conditional */}
            {form.rateType === "conditional" && (
              <>
                <div>
                  <label className={lbl}>Price below threshold (₹)</label>
                  <input type="number" className={inp} value={form.belowPrice}
                    onChange={(e) => f("belowPrice", Number(e.target.value))} />
                </div>
                <div>
                  <label className={lbl}>Free above order value (₹) — 0 = never free</label>
                  <input type="number" className={inp} value={form.freeAbove}
                    onChange={(e) => f("freeAbove", Number(e.target.value))} />
                </div>
              </>
            )}

            {/* Weight */}
            {form.rateType === "weight" && (
              <>
                <div>
                  <label className={lbl}>Base Price (₹)</label>
                  <input type="number" className={inp} value={form.basePrice}
                    onChange={(e) => f("basePrice", Number(e.target.value))} />
                </div>
                <div>
                  <label className={lbl}>Price per kg (₹)</label>
                  <input type="number" className={inp} value={form.pricePerKg}
                    onChange={(e) => f("pricePerKg", Number(e.target.value))} />
                </div>
                <div className="lg:col-span-3 bg-[#b08d57]/5 border border-[#b08d57]/20 p-3 text-[11px] text-neutral-400">
                  💡 Shipping cost = Base Price + (Product Weight in kg × Price per kg). Product weight is set per product in the Products tab.
                </div>
              </>
            )}
          </div>

          {/* Preview */}
          <div className="mt-5 p-3 bg-[#b08d57]/10 border border-[#b08d57]/20 text-[#b08d57] text-xs tracking-wide">
            Preview: {calcPreview()}
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-3 mt-5">
            <button onClick={() => f("active", !form.active)} className="flex items-center gap-2 text-sm text-neutral-300">
              {form.active
                ? <ToggleRight className="h-5 w-5 text-green-400" />
                : <ToggleLeft className="h-5 w-5 text-neutral-600" />}
              {form.active ? "Active — visible on checkout" : "Inactive — hidden from checkout"}
            </button>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={handleSave} disabled={saving}
              className="px-6 py-2.5 bg-[#b08d57] text-black text-[11px] tracking-[2px] uppercase hover:bg-[#c9a96e] transition-colors disabled:opacity-40">
              {saving ? "Saving…" : editing ? "Update Rate" : "Create Rate"}
            </button>
            <button onClick={cancel}
              className="px-6 py-2.5 border border-neutral-700 text-neutral-400 text-[11px] tracking-[2px] uppercase hover:border-neutral-500 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Rates table */}
      <div className="bg-[#1a1a1a] border border-neutral-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <RefreshCw className="h-5 w-5 text-[#b08d57] animate-spin" />
          </div>
        ) : rates.length === 0 ? (
          <div className="text-center py-24 text-neutral-500 text-sm">
            No shipping rates yet.{" "}
            <button onClick={handleSeed} className="text-[#b08d57] hover:underline">Seed defaults</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-left">
                  {["Name", "Scope", "Method", "Type", "Rate", "ETA", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-[10px] tracking-[2px] uppercase text-neutral-500 font-normal whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rates.map((r) => (
                  <tr key={r._id} className={`border-b border-neutral-800/50 hover:bg-white/[0.02] transition-colors ${!r.active ? "opacity-40" : ""}`}>
                    <td className="px-4 py-3 text-white font-medium whitespace-nowrap">{r.name}</td>
                    <td className="px-4 py-3 text-neutral-400 whitespace-nowrap text-xs">{SCOPE_LABELS[r.scope]}</td>
                    <td className="px-4 py-3 text-neutral-300 whitespace-nowrap capitalize">{r.method}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-[10px] tracking-[1.5px] uppercase px-2.5 py-1 border rounded-full ${RATE_TYPE_COLORS[r.rateType]}`}>
                        {RATE_TYPE_LABELS[r.rateType]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-300 whitespace-nowrap text-xs">
                      {r.rateType === "free"        && "Free"}
                      {r.rateType === "flat"        && `₹${r.price}`}
                      {r.rateType === "conditional" && `₹${r.belowPrice} / Free above ₹${r.freeAbove}`}
                      {r.rateType === "weight"      && `₹${r.basePrice} base + ₹${r.pricePerKg}/kg × weight`}
                    </td>
                    <td className="px-4 py-3 text-neutral-400 whitespace-nowrap text-xs">{r.eta || "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button onClick={() => handleToggle(r)} className="flex items-center gap-1.5 text-xs">
                        {r.active
                          ? <><ToggleRight className="h-4 w-4 text-green-400" /><span className="text-green-400">Active</span></>
                          : <><ToggleLeft className="h-4 w-4 text-neutral-600" /><span className="text-neutral-500">Inactive</span></>}
                      </button>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(r)} className="text-neutral-500 hover:text-[#b08d57] transition-colors">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(r._id)} className="text-neutral-500 hover:text-red-400 transition-colors">
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
    </div>
  );
}
