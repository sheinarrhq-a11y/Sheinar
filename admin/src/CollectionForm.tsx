import { useState, useRef, useEffect, type FormEvent } from "react";
import { X, Upload, Search, Loader2, Check } from "lucide-react";
import {
  createCollection, updateCollection,
  getCollectionProducts,
  type AdminCollection, type CollectionProduct,
} from "./api";

const inp = "w-full bg-[#0f0f0f] border border-neutral-700 px-3 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#b08d57] transition-colors";
const lbl = "block text-[10px] tracking-[2px] uppercase text-neutral-400 mb-1.5";

interface Props {
  collection?: AdminCollection;
  onSaved: (c: AdminCollection) => void;
  onCancel: () => void;
}

export default function CollectionForm({ collection, onSaved, onCancel }: Props) {
  const isEdit = !!collection;

  const [title, setTitle] = useState(collection?.title ?? "");
  const [slug, setSlug] = useState(collection?.slug ?? "");
  const [tag, setTag] = useState(collection?.tag ?? "");
  const [sortOrder, setSortOrder] = useState(collection?.sortOrder?.toString() ?? "0");
  const [imagePreview, setImagePreview] = useState<string>(collection?.image?.url ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  const [allProducts, setAllProducts] = useState<CollectionProduct[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(collection?.products.map((p) => p._id) ?? [])
  );
  const [search, setSearch] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getCollectionProducts()
      .then(setAllProducts)
      .catch(() => setAllProducts([]))
      .finally(() => setLoadingProducts(false));
  }, []);

  function handleTitleChange(v: string) {
    setTitle(v);
    if (!isEdit) setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  }

  function handleImageFile(file: File) {
    setImageFile(file);
    setRemoveImage(false);
    setImagePreview(URL.createObjectURL(file));
  }

  function toggleProduct(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const filtered = allProducts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.collection?.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("slug", slug);
      fd.append("tag", tag);
      fd.append("sortOrder", sortOrder);
      fd.append("products", JSON.stringify([...selectedIds]));
      if (imageFile) fd.append("image", imageFile);
      if (isEdit && removeImage) fd.append("removeImage", "true");

      const saved = isEdit
        ? await updateCollection(collection!._id, fd)
        : await createCollection(fd);
      onSaved(saved);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center overflow-y-auto py-8 px-4">
      <div className="bg-[#1a1a1a] border border-neutral-800 w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <h2 className="text-sm tracking-[2px] uppercase text-white">
            {isEdit ? "Edit Collection" : "New Collection"}
          </h2>
          <button onClick={onCancel} className="text-neutral-500 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">

            {/* Title + Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Title *</label>
                <input required value={title} onChange={(e) => handleTitleChange(e.target.value)}
                  className={inp} placeholder="Couture" />
              </div>
              <div>
                <label className={lbl}>Slug *</label>
                <input required value={slug} onChange={(e) => setSlug(e.target.value)}
                  className={inp} placeholder="couture" />
              </div>
            </div>

            {/* Tag + Sort */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Tag / Subtitle</label>
                <input value={tag} onChange={(e) => setTag(e.target.value)}
                  className={inp} placeholder="The   " />
              </div>
              <div>
                <label className={lbl}>Sort Order</label>
                <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}
                  className={inp} placeholder="0" />
              </div>
            </div>

            {/* Cover Image */}
            <div>
              <label className={lbl}>Cover Image</label>
              <div className="flex gap-4 items-start">
                {imagePreview ? (
                  <div className="relative shrink-0">
                    <img src={imagePreview} alt="cover" className="w-28 h-36 object-cover border border-neutral-700" />
                    <button type="button" onClick={() => { setImagePreview(""); setImageFile(null); setRemoveImage(true); }}
                      className="absolute -top-2 -right-2 bg-neutral-900 border border-neutral-700 text-neutral-400 hover:text-red-400 h-5 w-5 flex items-center justify-center transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleImageFile(f); }}
                    className="w-28 h-36 border-2 border-dashed border-neutral-700 hover:border-[#b08d57] transition-colors flex flex-col items-center justify-center cursor-pointer gap-2"
                  >
                    <Upload className="h-5 w-5 text-neutral-600" />
                    <span className="text-[10px] text-neutral-600 text-center px-1">Click or drag</span>
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    Upload a cover image for this collection. Recommended ratio 3:4. JPG, PNG or WEBP, max 10MB.
                  </p>
                  {!imagePreview && (
                    <button type="button" onClick={() => fileRef.current?.click()}
                      className="mt-3 text-[11px] tracking-[2px] uppercase text-[#b08d57] hover:text-white transition-colors">
                      Choose File
                    </button>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); }} />
              </div>
            </div>

            {/* Product Picker */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={lbl + " mb-0"}>Products in this Collection</label>
                <span className="text-[10px] text-[#b08d57]">{selectedIds.size} selected</span>
              </div>

              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-600" />
                <input
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  className={inp + " pl-9"}
                  placeholder="Search products by name or collection…"
                />
              </div>

              {/* Product list */}
              <div className="border border-neutral-800 max-h-72 overflow-y-auto">
                {loadingProducts ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-4 w-4 text-[#b08d57] animate-spin" />
                  </div>
                ) : filtered.length === 0 ? (
                  <p className="text-center text-neutral-600 text-sm py-10">
                    {allProducts.length === 0 ? "No products found. Add products first." : "No results."}
                  </p>
                ) : (
                  filtered.map((p) => {
                    const selected = selectedIds.has(p._id);
                    return (
                      <button
                        key={p._id}
                        type="button"
                        onClick={() => toggleProduct(p._id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 border-b border-neutral-800/50 last:border-0 transition-colors text-left ${
                          selected ? "bg-[#b08d57]/10" : "hover:bg-white/[0.03]"
                        }`}
                      >
                        {/* Checkbox */}
                        <div className={`h-4 w-4 shrink-0 border flex items-center justify-center transition-colors ${
                          selected ? "bg-[#b08d57] border-[#b08d57]" : "border-neutral-600"
                        }`}>
                          {selected && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                        </div>

                        {/* Thumbnail */}
                        {p.images?.[0] ? (
                          <img src={p.images[0].url} alt={p.title} className="w-10 h-12 object-cover shrink-0" />
                        ) : (
                          <div className="w-10 h-12 bg-neutral-800 shrink-0" />
                        )}

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{p.title}</p>
                          <p className="text-[10px] text-neutral-500 mt-0.5 uppercase tracking-wide">{p.collection}</p>
                        </div>

                        {/* Status */}
                        <span className={`text-[9px] tracking-[1px] uppercase px-2 py-0.5 shrink-0 ${
                          p.status === "in-stock" ? "text-green-400 bg-green-500/10" :
                          p.status === "preorder" ? "text-yellow-400 bg-yellow-500/10" :
                          "text-red-400 bg-red-500/10"
                        }`}>
                          {p.status}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Selected summary */}
              {selectedIds.size > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {allProducts.filter((p) => selectedIds.has(p._id)).map((p) => (
                    <span key={p._id} className="flex items-center gap-1 bg-[#b08d57]/15 text-[#b08d57] text-[10px] px-2 py-1">
                      {p.title.split("—")[0].trim()}
                      <button type="button" onClick={() => toggleProduct(p._id)}>
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          {error && <p className="px-6 pb-2 text-red-400 text-xs">{error}</p>}
          <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800 bg-[#141414]">
            <button type="button" onClick={onCancel}
              className="text-xs tracking-[2px] uppercase text-neutral-500 hover:text-white transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 bg-[#b08d57] text-white text-xs tracking-[3px] uppercase px-6 py-2.5 hover:bg-[#9a7a48] transition-colors disabled:opacity-50">
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {loading ? "Saving…" : isEdit ? "Update Collection" : "Create Collection"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
