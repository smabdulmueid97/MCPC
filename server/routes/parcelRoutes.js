// server/routes/parcelRoutes.js
const express = require("express");
const {
  bookParcel,
  getBookingHistory,
  trackParcel,
} = require("../controllers/parcelController");
const { protect, authorize } = require("../middleware/authMiddleware");
const router = express.Router();

router.route("/").post(protect, authorize("Customer"), bookParcel);
router.route("/history").get(protect, authorize("Customer"), getBookingHistory);
router.route("/track/:id").get(trackParcel);

module.exports = router;
