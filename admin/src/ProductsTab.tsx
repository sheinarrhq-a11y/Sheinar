import { useState, useEffect, useCallback } from "react";
import { getAdminProducts, deleteProduct, type AdminProduct } from "./api";
import { Plus, Pencil, Trash2, RefreshCw, Package } from "lucide-react";
import ProductForm from "./ProductForm";

export default function ProductsTab({ onUnauth }: { onUnauth: () => void }) {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | undefined>();
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await getAdminProducts();
      setProducts(data);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "UNAUTHORIZED") onUnauth();
      else setError("Failed to load products.");
    } finally { setLoading(false); }
  }, [onUnauth]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this product? This will also remove images from Cloudinary.")) return;
    setDeleting(id);
    try { await deleteProduct(id); setProducts((p) => p.filter((x) => x._id !== id)); }
    catch { setError("Delete failed."); }
    finally { setDeleting(null); }
  }

  function handleSaved(p: AdminProduct) {
    setProducts((prev) => {
      const idx = prev.findIndex((x) => x._id === p._id);
      if (idx >= 0) { const next = [...prev]; next[idx] = p; return next; }
      return [p, ...prev];
    });
    setShowForm(false); setEditing(undefined);
  }

  return (
    <div>
          <span className="bg-[#b08d57]/20 text-[#b08d57] text-xs px-2 py-0.5 rounded-full">{products.length}</span>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package className="h-4 w-4 text-[#b08d57]" />
          <span className="text-sm tracking-[2px] uppercase text-white">Products</span>
          <span className="bg-[#b08d57]/20 text-[#b08d57] text-xs px-2 py-0.5 rounded-full">{products.length}</span>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchProducts} className="flex items-center gap-1.5 text-neutral-400 hover:text-white text-xs tracking-[2px] uppercase transition-colors">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => { setEditing(undefined); setShowForm(true); }}
            className="flex items-center gap-2 bg-[#b08d57] text-white text-xs tracking-[2px] uppercase px-4 py-2 hover:bg-[#9a7a48] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Add Product
          </button>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {/* Table */}
      <div className="bg-[#1a1a1a] border border-neutral-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <RefreshCw className="h-5 w-5 text-[#b08d57] animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 text-neutral-500 text-sm">
            No products yet. Click "Add Product" to create your first one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-left">
                  {["Image", "Title", "Shop Category", "Price", "SKU", "Status", "Visibility", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-[10px] tracking-[2px] uppercase text-neutral-500 font-normal whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-b border-neutral-800/50 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      {p.images[0] ? (
                        <img src={p.images[0].url} alt={p.title} className="w-12 h-14 object-cover" />
                      ) : (
                        <div className="w-12 h-14 bg-neutral-800 flex items-center justify-center">
                          <Package className="h-4 w-4 text-neutral-600" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white font-medium max-w-[200px]">
                      <p className="truncate">{p.title}</p>
                      <p className="text-neutral-500 text-xs mt-0.5 truncate">{p.slug}</p>
                    </td>
                      <td className="px-4 py-3 text-neutral-300 whitespace-nowrap capitalize">{p.shopCategory || "Unassigned"}</td>
                    <td className="px-4 py-3 text-neutral-300 whitespace-nowrap">
                      ₹{p.price.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-neutral-400 whitespace-nowrap text-xs">{p.sku}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-[10px] tracking-[1.5px] uppercase px-2.5 py-1 border rounded-full ${p.hidden ? "border-red-500 text-red-300 bg-red-500/10" : "border-green-500 text-green-300 bg-green-500/10"}`}>
                        {p.hidden ? "Hidden" : "Visible"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <button onClick={() => { setEditing(p); setShowForm(true); }} className="text-neutral-400 hover:text-[#b08d57] transition-colors">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(p._id)} disabled={deleting === p._id} className="text-neutral-600 hover:text-red-400 transition-colors disabled:opacity-40">
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

      {/* Form modal */}
      {showForm && (
        <ProductForm
          product={editing}
          onSaved={handleSaved}
          onCancel={() => { setShowForm(false); setEditing(undefined); }}
        />
      )}
    </div>
  );
}
