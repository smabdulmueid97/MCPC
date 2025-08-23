// server/routes/adminRoutes.js
const express = require("express");
const {
  getAllParcels,
  assignAgent,
  getDashboardMetrics,
  getAllUsers,
  exportCsvReport,
  exportPdfReport, // Import the new controller
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");
const router = express.Router();

router.use(protect, authorize("Admin")); // [cite: 80]

router.get("/parcels", getAllParcels); // [cite: 80]
router.put("/parcels/:id/assign", assignAgent); // [cite: 80]
router.get("/dashboard", getDashboardMetrics); // [cite: 80]
router.get("/users", getAllUsers); // [cite: 80]
router.get("/reports/csv", exportCsvReport); // [cite: 80]
router.get("/reports/pdf", exportPdfReport); // Add the new route

module.exports = router;
