// server/models/Parcel.js
const mongoose = require("mongoose");

const ParcelSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pickupAddress: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    parcelDetails: {
      type: { type: String, required: true },
      size: {
        type: String,
        enum: ["Small", "Medium", "Large"],
        required: true,
      },
    },
    paymentType: { type: String, enum: ["COD", "Prepaid"], required: true },
    codAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Booked", "Picked Up", "In Transit", "Delivered", "Failed"],
      default: "Booked",
    },
    deliveryAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    trackingHistory: [
      {
        status: String,
        location: String, // Or GeoJSON for map coordinates
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Parcel", ParcelSchema);
