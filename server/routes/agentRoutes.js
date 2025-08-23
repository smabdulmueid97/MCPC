// server/routes/agentRoutes.js
const express = require("express");
const {
  getAssignedParcels,
  updateParcelStatus,
} = require("../controllers/agentController");
const { protect, authorize } = require("../middleware/authMiddleware");
const router = express.Router();

router.use(protect, authorize("Delivery Agent"));

router.get("/parcels", getAssignedParcels);
router.put("/parcels/:id/status", updateParcelStatus);

module.exports = router;
