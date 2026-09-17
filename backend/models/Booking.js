const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true },
    email:   { type: String, required: true, trim: true, lowercase: true },
    phone:   { type: String, trim: true },
    store:   { type: String, required: true },
    date:    { type: String, required: true },
    time:    { type: String, required: true },
    message: { type: String, trim: true },
    status:  { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
