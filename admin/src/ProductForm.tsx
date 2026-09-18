import { useState, useRef, useCallback, type FormEvent } from "react";
import { GripVertical, X, Upload, Plus, Loader2 } from "lucide-react";
import { DetailInput } from "./DetailInput";
import { createProduct, updateProduct, type AdminProduct } from "./api";

type ImageItem = { id: string; url: string; file?: File; public_id?: string; isNew: boolean };
type Variant = { size: "S" | "M" | "L"; stock: string };

const SIZES = ["S", "M", "L"] as const;

const STATUSES = [
  { value: "in-stock", label: "Ready to Ship" },
  { value: "preorder", label: "Pre-Order" },
  { value: "sold-out", label: "Sold Out" },
];

const SHOP_CATEGORIES = [
  { value: "sarees", label: "Sarees" },
  { value: "sharara", label: "Sharara" },
  { value: "lehenga", label: "Lehenga" },
  { value: "suits", label: "Suits" },
] as const;

const inp = "w-full bg-[#0f0f0f] border border-neutral-700 px-3 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#b08d57] transition-colors";
const lbl = "block text-[10px] tracking-[2px] uppercase text-neutral-400 mb-1.5";
const tab = (active: boolean) =>
  `px-4 py-2 text-[11px] tracking-[2px] uppercase border-b-2 transition-colors ${active ? "border-[#b08d57] text-[#b08d57]" : "border-transparent text-neutral-500 hover:text-neutral-300"}`;

function uid() { return Math.random().toString(36).slice(2); }

interface Props {
  product?: AdminProduct;
  onSaved: (p: AdminProduct) => void;
  onCancel: () => void;
}

export default function ProductForm({ product, onSaved, onCancel }: Props) {
  const isEdit = !!product;

  const [title, setTitle] = useState(product?.title ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [collection] = useState(product?.collection ?? "");
  const [shopCategory, setShopCategory] = useState(product?.shopCategory ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [currency] = useState(product?.currency ?? "INR");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [status, setStatus] = useState<AdminProduct["status"]>(product?.status ?? "in-stock");
  const [hidden, setHidden] = useState(product?.hidden ?? false);
  const [description, setDescription] = useState(product?.description ?? "");
  const [details, setDetails] = useState<string[]>(product?.details ?? [""]);
  const [shipping, setShipping] = useState(product?.shipping ?? "· Sheinar ships across the world via BlueDart, DTDC, DHL, UBX or FedEx express services.\n· Deliveries within India take roughly 3–5 working days.\n· Domestic shipping within India is complimentary.");
  const [care, setCare] = useState(product?.care ?? "· Store carefully, away from the sun, dust, and moisture, preferably in muslin cloth.\n· Dry-clean only when required.\n· Avoid ironing directly on the zari.");
  const [manufacturer, setManufacturer] = useState(product?.manufacturer ?? "· Manufactured & Packaged by: Sheinar   ,  Mohali, India.\n· For feedback: sheinarrhq@gmail.com | +917719490036\n· Country of Origin — India");
  const [dimensions, setDimensions] = useState(product?.dimensions ?? "· Saree — L 5.4 m × W 1.1 m\n· All garments are made to order.");
  const [sortOrder, setSortOrder] = useState(product?.sortOrder?.toString() ?? "0");
  const [weightKg, setWeightKg] = useState(product?.weightKg?.toString() ?? "0.5");

  const [variants, setVariants] = useState<Variant[]>(
    product?.variants?.map((v) => ({ size: v.size, stock: String(v.stock) })) ?? []
  );

  const [images, setImages] = useState<ImageItem[]>(
    product?.images.map((img) => ({ id: uid(), url: img.url, public_id: img.public_id, isNew: false })) ?? []
  );
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"basic" | "images" | "tabs">("basic");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Auto-generate slug from title
  function handleTitleChange(v: string) {
    setTitle(v);
    if (!isEdit) setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  }

  // Image file pick
  function handleFiles(files: FileList | null) {
    if (!files) return;
    const items: ImageItem[] = Array.from(files).map((f) => ({
      id: uid(), url: URL.createObjectURL(f), file: f, isNew: true,
    }));
    setImages((prev) => [...prev, ...items]);
  }

  function removeImage(id: string) {
    setImages((prev) => prev.filter((img) => img.id !== id));
  }

  // Drag-to-reorder
  const onDragStart = useCallback((id: string) => setDragging(id), []);
  const onDragEnter = useCallback((id: string) => setDragOver(id), []);
  const onDrop = useCallback(() => {
    if (!dragging || !dragOver || dragging === dragOver) { setDragging(null); setDragOver(null); return; }
    setImages((prev) => {
      const arr = [...prev];
      const from = arr.findIndex((i) => i.id === dragging);
      const to = arr.findIndex((i) => i.id === dragOver);
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
    setDragging(null); setDragOver(null);
  }, [dragging, dragOver]);

  function addVariant(size: "S" | "M" | "L") {
    if (variants.find((v) => v.size === size)) return;
    setVariants((prev) => [...prev, { size, stock: "1" }]);
  }
  function removeVariant(size: string) {
    setVariants((prev) => prev.filter((v) => v.size !== size));
  }
  function setVariantStock(size: string, stock: string) {
    setVariants((prev) => prev.map((v) => v.size === size ? { ...v, stock } : v));
  }

  // Details bullet list
  function setDetail(i: number, v: string) {
    setDetails((prev) => prev.map((d, idx) => idx === i ? v : d));
  }
  function addDetail() { setDetails((prev) => [...prev, ""]); }
  function removeDetail(i: number) { setDetails((prev) => prev.filter((_, idx) => idx !== i)); }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (images.length === 0) { setError("Add at least one image."); setActiveTab("images"); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("slug", slug);
          fd.append("collection", collection);
      fd.append("shopCategory", shopCategory);
      fd.append("price", price);
      fd.append("currency", currency);
      fd.append("sku", sku);
      fd.append("status", status);
      fd.append("description", description);
      fd.append("details", JSON.stringify(details.filter(Boolean)));
      fd.append("shipping", shipping);
      fd.append("care", care);
      fd.append("manufacturer", manufacturer);
      fd.append("dimensions", dimensions);
      fd.append("variants", JSON.stringify(variants.map((v) => ({ size: v.size, stock: Number(v.stock) || 0 }))));
      fd.append("sortOrder", sortOrder);
      fd.append("weightKg", weightKg);
      fd.append("hidden", hidden ? "true" : "false");

      if (isEdit) {
        // Existing images to keep (in order)
        const existing = images.filter((i) => !i.isNew).map((i) => ({ url: i.url, public_id: i.public_id }));
        fd.append("existingImages", JSON.stringify(existing));
        // New files
        images.filter((i) => i.isNew && i.file).forEach((i) => fd.append("images", i.file!));
        // Final order: existing first (by position), then new appended
        const orderIndices = images.map((_, idx) => idx).join(",");
        fd.append("imageOrder", orderIndices);
        const saved = await updateProduct(product!._id, fd);
        onSaved(saved);
      } else {
        images.filter((i) => i.file).forEach((i) => fd.append("images", i.file!));
        const saved = await createProduct(fd);
        onSaved(saved);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center overflow-y-auto py-8 px-4">
      <div className="bg-[#1a1a1a] border border-neutral-800 w-full max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <h2 className="text-sm tracking-[2px] uppercase text-white">{isEdit ? "Edit Product" : "Add Product"}</h2>
          <button onClick={onCancel} className="text-neutral-500 hover:text-white transition-colors"><X className="h-4 w-4" /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-800 px-6">
          {(["basic", "images", "tabs"] as const).map((t) => (
            <button key={t} onClick={() => setActiveTab(t)} className={tab(activeTab === t)}>
              {t === "basic" ? "Details" : t === "images" ? `Images (${images.length})` : "Product Tabs"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5">

            {/* ── BASIC TAB ── */}
            {activeTab === "basic" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Title *</label>
                    <input required value={title} onChange={(e) => handleTitleChange(e.target.value)} className={inp} placeholder="Noor — Ivory Zardozi Lehenga" />
                  </div>
                  <div>
                    <label className={lbl}>Slug *</label>
                    <input required value={slug} onChange={(e) => setSlug(e.target.value)} className={inp} placeholder="noor-ivory-lehenga" />
                  </div>
                </div>

                <div>
                  <label className={lbl}>Shop Category *</label>
                  <select required value={shopCategory} onChange={(e) => setShopCategory(e.target.value)} className={inp}>
                    <option value="">Select a Shop category</option>
                    {SHOP_CATEGORIES.map((category) => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-neutral-500 mt-1">Controls which Shop submenu page displays this product. This is separate from Collections.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Price (₹) *</label>
                    <input required type="number" value={price} onChange={(e) => setPrice(e.target.value)} className={inp} placeholder="285000" />
                  </div>
                  <div>
                    <label className={lbl}>SKU *</label>
                    <input required value={sku} onChange={(e) => setSku(e.target.value)} className={inp} placeholder="SH-NR-001" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Status *</label>
                    <select required value={status} onChange={(e) => setStatus(e.target.value as AdminProduct["status"])} className={inp}>
                      {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                    <p className="text-[10px] text-neutral-500 mt-1">
                      {status === "preorder" ? "Shows Pre-Order button + consent checkbox → checkout" :
                       status === "in-stock" ? "Shows Add to Bag → opens cart drawer" :
                       "Shows Enquire Now button"}
                    </p>
                  </div>
                  <div>
                    <label className={lbl}>Sort Order</label>
                    <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className={inp} placeholder="0" />
                  </div>
                </div>
                <div className="flex items-start gap-3 mt-3">
                  <label className="inline-flex items-center gap-2 text-sm text-neutral-200">
                    <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} className="form-checkbox h-4 w-4 text-[#b08d57] bg-[#0f0f0f] border-neutral-700 rounded" />
                    <span className="text-[12px] uppercase tracking-[2px]">Hide from website</span>
                  </label>
                </div>
                <p className="text-[10px] text-neutral-500 mt-1">Hidden products remain in the admin panel but are excluded from the public site and storefront.</p>

                {/* Weight */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Product Weight (kg)</label>
                    <input type="number" step="0.01" min="0" value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)} className={inp} placeholder="0.5" />
                    <p className="text-[10px] text-neutral-500 mt-1">Used to calculate weight-based shipping rates</p>
                  </div>
                </div>

                <div>
                  <label className={lbl}>Description *</label>
                  <textarea required rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={inp} placeholder="Hand-embroidered in our    over four months…" />
                </div>

                <div>
                  <label className={lbl}>Product Details (bullet points)</label>
                  <p className="text-[10px] text-neutral-500 mb-2">Use **text** to make text bold. Click the <strong>B</strong> button to wrap selected text.</p>
                  <div className="space-y-2">
                    {details.map((d, i) => (
                      <DetailInput
                        key={i}
                        value={d}
                        onChange={(v) => setDetail(i, v)}
                        onRemove={() => removeDetail(i)}
                        placeholder={`Detail ${i + 1}`}
                      />
                    ))}
                    <button type="button" onClick={addDetail} className="flex items-center gap-1.5 text-[11px] tracking-[2px] uppercase text-neutral-500 hover:text-[#b08d57] transition-colors">
                      <Plus className="h-3.5 w-3.5" /> Add Detail
                    </button>
                  </div>
                </div>

                {/* Variants */}
                <div>
                  <label className={lbl}>Size Variants</label>
                  <p className="text-[10px] text-neutral-600 mb-3">Select which sizes are available for this product. Only selected sizes appear on the product page.</p>

                  {/* Size toggle buttons */}
                  <div className="flex gap-2 mb-4">
                    {SIZES.map((s) => {
                      const active = !!variants.find((v) => v.size === s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => active ? removeVariant(s) : addVariant(s)}
                          className={`w-12 h-12 border text-sm font-serif transition-all ${
                            active
                              ? "border-[#b08d57] bg-[#b08d57]/15 text-[#b08d57]"
                              : "border-neutral-700 text-neutral-500 hover:border-neutral-500"
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                    <span className="text-[10px] text-neutral-600 self-center ml-2">Click to toggle availability</span>
                  </div>

                  {/* Stock inputs for selected sizes */}
                  {variants.length > 0 && (
                    <div className="space-y-2">
                      {variants.map((v) => (
                        <div key={v.size} className="flex items-center gap-3">
                          <span className="w-10 h-10 border border-[#b08d57] bg-[#b08d57]/10 text-[#b08d57] text-sm font-serif flex items-center justify-center shrink-0">{v.size}</span>
                          <input
                            type="number"
                            min="0"
                            value={v.stock}
                            onChange={(e) => setVariantStock(v.size, e.target.value)}
                            className={inp + " max-w-[140px]"}
                            placeholder="Stock qty"
                          />
                          <span className="text-[10px] text-neutral-500">units in stock</span>
                          <button type="button" onClick={() => removeVariant(v.size)} className="text-neutral-600 hover:text-red-400 transition-colors ml-auto">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── IMAGES TAB ── */}
            {activeTab === "images" && (
              <div className="space-y-4">
                <p className="text-[11px] text-neutral-500 tracking-wide">Drag to reorder. First image is the main product image.</p>

                {/* Drop zone */}
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
                  className="border-2 border-dashed border-neutral-700 hover:border-[#b08d57] transition-colors p-8 text-center cursor-pointer"
                >
                  <Upload className="h-6 w-6 text-neutral-600 mx-auto mb-2" />
                  <p className="text-sm text-neutral-500">Click or drag images here</p>
                  <p className="text-[11px] text-neutral-600 mt-1">JPG, PNG, WEBP · max 10MB each</p>
                  <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                </div>

                {/* Image grid with drag reorder */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {images.map((img, idx) => (
                      <div
                        key={img.id}
                        draggable
                        onDragStart={() => onDragStart(img.id)}
                        onDragEnter={() => onDragEnter(img.id)}
                        onDragEnd={onDrop}
                        onDragOver={(e) => e.preventDefault()}
                        className={`relative group aspect-square border-2 transition-all cursor-grab active:cursor-grabbing ${
                          dragOver === img.id ? "border-[#b08d57] scale-105" : "border-neutral-700"
                        }`}
                      >
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 bg-[#b08d57] text-white text-[9px] tracking-[1px] uppercase px-1.5 py-0.5">Main</span>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <GripVertical className="h-4 w-4 text-white" />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(img.id)}
                          className="absolute top-1 right-1 bg-black/60 text-white h-5 w-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1">{idx + 1}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── TABS TAB ── */}
            {activeTab === "tabs" && (
              <div className="space-y-5">
                <div>
                  <label className={lbl}>Shipping & Delivery</label>
                  <textarea rows={5} value={shipping} onChange={(e) => setShipping(e.target.value)} className={inp} placeholder="· Each line becomes a bullet point on the product page" />
                </div>
                <div>
                  <label className={lbl}>Care Instructions</label>
                  <textarea rows={4} value={care} onChange={(e) => setCare(e.target.value)} className={inp} />
                </div>
                <div>
                  <label className={lbl}>Dimensions</label>
                  <textarea rows={4} value={dimensions} onChange={(e) => setDimensions(e.target.value)} className={inp} />
                </div>
                <div>
                  <label className={lbl}>Manufacturer / The Maker</label>
                  <textarea rows={4} value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} className={inp} />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {error && <p className="px-6 pb-2 text-red-400 text-xs">{error}</p>}
          <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800 bg-[#141414]">
            <button type="button" onClick={onCancel} className="text-xs tracking-[2px] uppercase text-neutral-500 hover:text-white transition-colors">Cancel</button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-[#b08d57] text-white text-xs tracking-[3px] uppercase px-6 py-2.5 hover:bg-[#9a7a48] transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {loading ? "Saving…" : isEdit ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
