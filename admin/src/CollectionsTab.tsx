import { useState, useEffect, useCallback } from "react";
import { getAdminCollections, deleteCollection, type AdminCollection } from "./api";
import { Plus, Pencil, Trash2, RefreshCw, LayoutGrid, Package } from "lucide-react";
import CollectionForm from "./CollectionForm";

export default function CollectionsTab({ onUnauth }: { onUnauth: () => void }) {
  const [collections, setCollections] = useState<AdminCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminCollection | undefined>();
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchCollections = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await getAdminCollections();
      setCollections(data);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "UNAUTHORIZED") onUnauth();
      else setError("Failed to load collections.");
    } finally { setLoading(false); }
  }, [onUnauth]);

  useEffect(() => { fetchCollections(); }, [fetchCollections]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this collection? Products will not be deleted.")) return;
    setDeleting(id);
    try { await deleteCollection(id); setCollections((c) => c.filter((x) => x._id !== id)); }
    catch { setError("Delete failed."); }
    finally { setDeleting(null); }
  }

  function handleSaved(c: AdminCollection) {
    setCollections((prev) => {
      const idx = prev.findIndex((x) => x._id === c._id);
      if (idx >= 0) { const next = [...prev]; next[idx] = c; return next; }
      return [c, ...prev];
    });
    setShowForm(false); setEditing(undefined);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <LayoutGrid className="h-4 w-4 text-[#b08d57]" />
          <span className="text-sm tracking-[2px] uppercase text-white">Collections</span>
          <span className="bg-[#b08d57]/20 text-[#b08d57] text-xs px-2 py-0.5 rounded-full">{collections.length}</span>
        </div>
        <div className="flex gap-3 items-center">
          <button onClick={fetchCollections} className="text-neutral-400 hover:text-white transition-colors">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => { setEditing(undefined); setShowForm(true); }}
            className="flex items-center gap-2 bg-[#b08d57] text-white text-xs tracking-[2px] uppercase px-4 py-2 hover:bg-[#9a7a48] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> New Collection
          </button>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <RefreshCw className="h-5 w-5 text-[#b08d57] animate-spin" />
        </div>
      ) : collections.length === 0 ? (
        <div className="bg-[#1a1a1a] border border-neutral-800 text-center py-24 text-neutral-500 text-sm">
          No collections yet. Click "New Collection" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((c) => (
            <div key={c._id} className="bg-[#1a1a1a] border border-neutral-800 overflow-hidden group">
              {/* Cover image */}
              <div className="relative aspect-[4/3] bg-neutral-900 overflow-hidden">
                {c.image?.url ? (
                  <img src={c.image.url} alt={c.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <LayoutGrid className="h-8 w-8 text-neutral-700" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Action buttons */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditing(c); setShowForm(true); }}
                    className="bg-black/70 text-white h-8 w-8 flex items-center justify-center hover:bg-[#b08d57] transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(c._id)}
                    disabled={deleting === c._id}
                    className="bg-black/70 text-white h-8 w-8 flex items-center justify-center hover:bg-red-500 transition-colors disabled:opacity-40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  {c.tag && <p className="text-[10px] tracking-[3px] uppercase text-[#b08d57] mb-1">{c.tag}</p>}
                  <h3 className="font-serif text-white text-xl">{c.title}</h3>
                </div>
              </div>

              {/* Products count + list */}
              <div className="px-4 py-3 border-t border-neutral-800">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-3.5 w-3.5 text-neutral-500" />
                  <span className="text-[11px] tracking-[2px] uppercase text-neutral-500">
                    {c.products.length} product{c.products.length !== 1 ? "s" : ""}
                  </span>
                </div>
                {c.products.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap">
                    {c.products.slice(0, 4).map((p) => (
                      <div key={p._id} className="relative">
                        {p.images?.[0] ? (
                          <img src={p.images[0].url} alt={p.title} className="w-9 h-11 object-cover border border-neutral-700" title={p.title} />
                        ) : (
                          <div className="w-9 h-11 bg-neutral-800 border border-neutral-700" />
                        )}
                      </div>
                    ))}
                    {c.products.length > 4 && (
                      <div className="w-9 h-11 bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                        <span className="text-[10px] text-neutral-400">+{c.products.length - 4}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Slug */}
              <div className="px-4 pb-3">
                <span className="text-[10px] text-neutral-600 font-mono">/{c.slug}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <CollectionForm
          collection={editing}
          onSaved={handleSaved}
          onCancel={() => { setShowForm(false); setEditing(undefined); }}
        />
      )}
    </div>
  );
}
