const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    slug:        { type: String, required: true, unique: true, trim: true, lowercase: true },
    collection:  { type: String, required: false, trim: true, default: "" },
    shopCategory:{ type: String, trim: true, default: "" },
    price:       { type: Number, required: true },
    currency:    { type: String, default: "INR" },
    sku:         { type: String, required: true, trim: true },
    status:      { type: String, enum: ["in-stock", "preorder", "sold-out"], default: "in-stock" },
    hidden:      { type: Boolean, default: false },
    description: { type: String, required: true },
    details:     [{ type: String }],
    images:      [{ url: String, public_id: String }], // ordered array
    // variants — size + stock
    variants:    [{
      size:  { type: String, enum: ["S", "M", "L"], required: true },
      stock: { type: Number, default: 0 },
    }],
    // accordion tabs
    shipping:    { type: String, default: "" },
    care:        { type: String, default: "" },
    manufacturer:{ type: String, default: "" },
    dimensions:  { type: String, default: "" },
    weightKg:    { type: Number, default: 0.5 },  // product weight in kg for shipping calc
    sortOrder:   { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
