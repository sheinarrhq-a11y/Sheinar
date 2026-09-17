const express = require("express");
const router = express.Router();
const multer = require("multer");
const auth = require("../middleware/auth");
const Collection = require("../models/Collection");
const Product = require("../models/Product");
const { uploadBuffer, deleteImage } = require("../utils/cloudinary");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1, fields: 10, parts: 12 },
  fileFilter: (req, file, callback) => {
    if (!/^image\/(jpeg|png|webp|avif)$/.test(file.mimetype)) {
      return callback(new Error("Only JPEG, PNG, WebP, and AVIF images are allowed."));
    }
    callback(null, true);
  },
});

// ── Public ────────────────────────────────────────────────

// GET /api/collections
router.get("/", async (req, res) => {
  try {
    const cols = await Collection.find()
      .sort({ sortOrder: 1, createdAt: -1 })
      .populate({ path: "products", match: { hidden: { $ne: true } }, select: "title slug images status price currency" })
      .lean();
    res.json(cols);
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

// ── Admin (protected) — MUST be before /:slug ─────────────

// GET /api/collections/admin/all-products — for product picker
router.get("/admin/all-products", auth, async (req, res) => {
  try {
    const products = await Product.find({}, "title slug images status collection").sort({ createdAt: -1 }).lean();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

// POST /api/collections
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const { title, slug, tag, products, sortOrder } = req.body;

    let image = null;
    if (req.file) {
      image = await uploadBuffer(req.file.buffer, `collection-${slug}-${Date.now()}`);
    }

    const col = await Collection.create({
      title, slug, tag: tag || "",
      image,
      products: products ? JSON.parse(products) : [],
      sortOrder: sortOrder ? Number(sortOrder) : 0,
    });

    res.status(201).json(col);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: "Slug already exists." });
    res.status(500).json({ error: err.message || "Server error." });
  }
});

// PUT /api/collections/:id
router.put("/:id", auth, upload.single("image"), async (req, res) => {
  try {
    const col = await Collection.findById(req.params.id);
    if (!col) return res.status(404).json({ error: "Not found." });

    const { title, slug, tag, products, sortOrder, removeImage } = req.body;

    if (req.file) {
      if (col.image?.public_id) await deleteImage(col.image.public_id).catch(() => {});
      col.image = await uploadBuffer(req.file.buffer, `collection-${slug}-${Date.now()}`);
    } else if (removeImage === "true") {
      if (col.image?.public_id) await deleteImage(col.image.public_id).catch(() => {});
      col.image = null;
    }

    col.title = title;
    col.slug = slug;
    col.tag = tag || "";
    col.products = products ? JSON.parse(products) : col.products;
    col.sortOrder = sortOrder !== undefined ? Number(sortOrder) : col.sortOrder;

    await col.save();
    res.json(col);
  } catch (err) {
    res.status(500).json({ error: err.message || "Server error." });
  }
});

// DELETE /api/collections/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    const col = await Collection.findByIdAndDelete(req.params.id);
    if (!col) return res.status(404).json({ error: "Not found." });
    if (col.image?.public_id) await deleteImage(col.image.public_id).catch(() => {});
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

// GET /api/collections/:slug — MUST be last to avoid catching admin routes
router.get("/:slug", async (req, res) => {
  try {
    const col = await Collection.findOne({ slug: req.params.slug })
      .populate({ path: "products", match: { hidden: { $ne: true } }, select: "title slug images status price currency sku description details shipping care manufacturer dimensions variants" })
      .lean();
    if (!col) return res.status(404).json({ error: "Not found." });
    res.json(col);
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

module.exports = router;
