// server/controllers/parcelController.js
const Parcel = require("../models/Parcel");
const User = require("../models/User");

// @desc    Book a new parcel
// @route   POST /api/parcels
// @access  Private/Customer
const bookParcel = async (req, res) => {
  const {
    pickupAddress,
    deliveryAddress,
    parcelDetails,
    paymentType,
    codAmount,
  } = req.body;
  try {
    const parcel = new Parcel({
      customer: req.user._id,
      pickupAddress,
      deliveryAddress,
      parcelDetails,
      paymentType,
      codAmount: paymentType === "COD" ? codAmount : 0,
      trackingHistory: [{ status: "Booked", location: pickupAddress }],
    });
    const createdParcel = await parcel.save();

    // Emit event for new booking
    req.io.emit("new_booking", createdParcel);

    res.status(201).json(createdParcel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get booking history for a customer
// @route   GET /api/parcels/history
// @access  Private/Customer
const getBookingHistory = async (req, res) => {
  try {
    const parcels = await Parcel.find({ customer: req.user._id }).populate(
      "deliveryAgent",
      "name"
    );
    res.json(parcels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Track a parcel by its ID
// @route   GET /api/parcels/track/:id
// @access  Public
const trackParcel = async (req, res) => {
  try {
    const parcel = await Parcel.findById(req.params.id).populate(
      "deliveryAgent",
      "name email"
    );
    if (!parcel) {
      return res.status(404).json({ message: "Parcel not found" });
    }
    res.json(parcel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { bookParcel, getBookingHistory, trackParcel };
