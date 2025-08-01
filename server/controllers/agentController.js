// server/controllers/agentController.js
const Parcel = require("../models/Parcel");

// @desc    Get parcels assigned to an agent
// @route   GET /api/agent/parcels
// @access  Private/Delivery Agent
const getAssignedParcels = async (req, res) => {
  try {
    const parcels = await Parcel.find({ deliveryAgent: req.user._id }).populate(
      "customer",
      "name email"
    );
    res.json(parcels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update parcel status
// @route   PUT /api/agent/parcels/:id/status
// @access  Private/Delivery Agent
const updateParcelStatus = async (req, res) => {
  const { status, location } = req.body;
  try {
    const parcel = await Parcel.findById(req.params.id);
    if (!parcel) {
      return res.status(404).json({ message: "Parcel not found" });
    }
    // Ensure the agent is assigned to this parcel
    if (parcel.deliveryAgent.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this parcel" });
    }

    parcel.status = status;
    parcel.trackingHistory.push({ status, location });
    const updatedParcel = await parcel.save();

    // Emit real-time status update
    req.io.emit("status_update", { parcelId: parcel._id, status, location });

    res.json(updatedParcel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAssignedParcels, updateParcelStatus };
