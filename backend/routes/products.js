const express = require("express");
const router = express.Router();
const multer = require("multer");
const auth = require("../middleware/auth");
const Product = require("../models/Product");
const { uploadBuffer, deleteImage } = require("../utils/cloudinary");

const sharp = require("sharp");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 10, fields: 30, parts: 45 },
  fileFilter: (req, file, callback) => {
    if (!/^image\/(jpeg|png|webp|avif)$/.test(file.mimetype)) {
      return callback(new Error("Only JPEG, PNG, WebP, and AVIF images are allowed."));
    }
    callback(null, true);
  },
});

// Compress image buffer: resize to max 2000px wide, convert to webp quality 82
async function compressImage(buffer) {
  return sharp(buffer)
    .resize({ width: 2000, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
}

function handleUpload(req, res, next) {
  upload.array("images", 10)(req, res, (err) => {
    if (err?.code === "LIMIT_FILE_SIZE") return res.status(400).json({ error: "File too large. Max 10MB per image." });
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}

// ── Public ──────────────────────────────────────────────

// GET /api/products  — all public products sorted
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({ hidden: { $ne: true } }).sort({ sortOrder: 1, createdAt: -1 }).lean();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

// GET /api/products/admin — admin sees all products including hidden ones
router.get("/admin", auth, async (req, res) => {
  try {
    const products = await Product.find().sort({ sortOrder: 1, createdAt: -1 }).lean();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

// GET /api/products/:slug
router.get("/:slug", async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, hidden: { $ne: true } }).lean();
    if (!product) return res.status(404).json({ error: "Not found." });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

// ── Admin (protected) ────────────────────────────────────

// POST /api/products  — create with images
router.post("/", auth, handleUpload, async (req, res) => {
  try {
    const { title, slug, collection, shopCategory, price, currency, sku, status, hidden, description, details,
            shipping, care, manufacturer, dimensions, sortOrder, imageOrder, variants, weightKg } = req.body;

    // Compress then upload all files to Cloudinary
    const uploaded = await Promise.all(
      (req.files || []).map(async (f) => {
        const compressed = await compressImage(f.buffer);
        return uploadBuffer(compressed, `${slug}-${Date.now()}-${Math.random().toString(36).slice(2)}`);
      })
    );

    // Reorder images if imageOrder provided (comma-separated indices)
    let images = uploaded;
    if (imageOrder) {
      const order = imageOrder.split(",").map(Number);
      images = order.map((i) => uploaded[i]).filter(Boolean);
    }

    const product = await Product.create({
      title, slug, collection, shopCategory: shopCategory || "", price: Number(price),
      currency: currency || "INR", sku, status, hidden: hidden === "true", description,
      details: details ? JSON.parse(details) : [],
      images,
      shipping: shipping || "", care: care || "",
      manufacturer: manufacturer || "", dimensions: dimensions || "",
      sortOrder: sortOrder ? Number(sortOrder) : 0,
      variants: variants ? JSON.parse(variants) : [],
      weightKg: weightKg ? Number(weightKg) : 0.5,
    });

    res.status(201).json(product);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: "Slug already exists." });
    res.status(500).json({ error: err.message || "Server error." });
  }
});

// PUT /api/products/:id  — update (images optional)
router.put("/:id", auth, handleUpload, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Not found." });

    const { title, slug, collection, shopCategory, price, currency, sku, status, hidden, description, details,
            shipping, care, manufacturer, dimensions, sortOrder,
            existingImages, imageOrder, variants, weightKg } = req.body;

    // Parse existing images kept by admin
    let images = existingImages ? JSON.parse(existingImages) : product.images;

    // Compress then upload new files
    if (req.files && req.files.length > 0) {
      const newUploads = await Promise.all(
        req.files.map(async (f) => {
          const compressed = await compressImage(f.buffer);
          return uploadBuffer(compressed, `${slug}-${Date.now()}-${Math.random().toString(36).slice(2)}`);
        })
      );
      images = [...images, ...newUploads];
    }

    // Apply final order
    if (imageOrder) {
      const order = imageOrder.split(",").map(Number);
      images = order.map((i) => images[i]).filter(Boolean);
    }

    Object.assign(product, {
      title, slug, collection, shopCategory: shopCategory ?? product.shopCategory, price: Number(price),
      currency: currency || "INR", sku, status, hidden: hidden === "true", description,
      details: details ? JSON.parse(details) : product.details,
      images,
      shipping: shipping ?? product.shipping,
      care: care ?? product.care,
      manufacturer: manufacturer ?? product.manufacturer,
      dimensions: dimensions ?? product.dimensions,
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : product.sortOrder,
      variants: variants ? JSON.parse(variants) : product.variants,
      weightKg: weightKg !== undefined ? Number(weightKg) : product.weightKg,
    });

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message || "Server error." });
  }
});

// DELETE /api/products/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Not found." });
    // Delete images from Cloudinary
    await Promise.allSettled(product.images.map((img) => deleteImage(img.public_id)));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

module.exports = router;
