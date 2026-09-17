const mongoose = require("mongoose");

const collectionSchema = new mongoose.Schema(
  {
    title:     { type: String, required: true, trim: true },
    slug:      { type: String, required: true, unique: true, trim: true, lowercase: true },
    tag:       { type: String, default: "" },
    image:     { url: String, public_id: String },
    products:  [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Collection", collectionSchema);
