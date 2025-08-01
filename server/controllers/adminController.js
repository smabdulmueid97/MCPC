// server/controllers/adminController.js
const Parcel = require("../models/Parcel");
const User = require("../models/User");
const { createObjectCsvWriter } = require("csv-writer");
const PDFDocument = require("pdfkit"); // [cite: 54]
const fs = require("fs");

// @desc    Get all parcels for admin view
// @route   GET /api/admin/parcels
// @access  Private/Admin
const getAllParcels = async (req, res) => {
  try {
    const parcels = await Parcel.find({})
      .populate("customer", "name email")
      .populate("deliveryAgent", "name email");
    res.json(parcels); // [cite: 55]
  } catch (error) {
    res.status(500).json({ message: error.message }); // [cite: 55]
  }
};

// @desc    Assign a delivery agent to a parcel
// @route   PUT /api/admin/parcels/:id/assign
// @access  Private/Admin
const assignAgent = async (req, res) => {
  try {
    const parcel = await Parcel.findById(req.params.id); // [cite: 56]
    if (!parcel) {
      return res.status(404).json({ message: "Parcel not found" }); // [cite: 57]
    }
    parcel.deliveryAgent = req.body.agentId; // [cite: 58]
    const updatedParcel = await parcel.save();
    res.json(updatedParcel); // [cite: 58]
  } catch (error) {
    res.status(500).json({ message: error.message }); // [cite: 59]
  }
};

// @desc    Get dashboard metrics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardMetrics = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // [cite: 61]

    const dailyBookings = await Parcel.countDocuments({
      createdAt: { $gte: today },
    }); // [cite: 61]
    const failedDeliveries = await Parcel.countDocuments({ status: "Failed" }); // [cite: 62]
    const codParcels = await Parcel.find({
      paymentType: "COD",
      status: "Delivered",
    }); // [cite: 62]
    const totalCodAmount = codParcels.reduce(
      (acc, parcel) => acc + parcel.codAmount,
      0
    ); // [cite: 63]

    res.json({ dailyBookings, failedDeliveries, totalCodAmount }); // [cite: 63]
  } catch (error) {
    res.status(500).json({ message: error.message }); // [cite: 64]
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password"); // [cite: 65]
    res.json(users); // [cite: 66]
  } catch (error) {
    res.status(500).json({ message: error.message }); // [cite: 66]
  }
};

// @desc    Export report as CSV
// @route   GET /api/admin/reports/csv
// @access  Private/Admin
const exportCsvReport = async (req, res) => {
  try {
    const parcels = await Parcel.find({})
      .populate("customer", "name")
      .populate("deliveryAgent", "name"); // [cite: 67]
    res.header("Content-Type", "text/csv"); // [cite: 68]
    res.attachment("parcels-report.csv"); // [cite: 68]

    const csvWriter = createObjectCsvWriter({
      path: "parcels-report.csv", // [cite: 68]
      header: [
        { id: "id", title: "ID" },
        { id: "customer", title: "Customer" },
        { id: "deliveryAgent", title: "Agent" },
        { id: "status", title: "Status" },
        { id: "paymentType", title: "Payment" },
        { id: "createdAt", title: "Booked On" },
      ],
    });
    const records = parcels.map((p) => ({
      id: p._id.toString(),
      customer: p.customer ? p.customer.name : "N/A",
      deliveryAgent: p.deliveryAgent ? p.deliveryAgent.name : "Unassigned",
      status: p.status,
      paymentType: p.paymentType,
      createdAt: p.createdAt.toLocaleDateString(),
    })); // [cite: 70]
    await csvWriter.writeRecords(records);
    fs.createReadStream("parcels-report.csv").pipe(res); // [cite: 71]
  } catch (error) {
    res.status(500).json({ message: "Failed to generate CSV report" }); // [cite: 72]
  }
};

// @desc    Export report as PDF
// @route   GET /api/admin/reports/pdf
// @access  Private/Admin
const exportPdfReport = async (req, res) => {
  try {
    const parcels = await Parcel.find({})
      .populate("customer", "name")
      .populate("deliveryAgent", "name");

    res.header("Content-Type", "application/pdf");
    res.attachment("parcels-report.pdf");

    const doc = new PDFDocument({ margin: 30, size: "A4" });
    doc.pipe(res);

    // Add header
    doc.fontSize(18).text("Parcels Report", { align: "center" });
    doc.moveDown();

    // Table headers
    const tableTop = doc.y;
    doc.fontSize(10);
    doc.text("Parcel ID", 30, tableTop, { width: 150, continued: true });
    doc.text("Customer", 190, tableTop, { width: 100, continued: true });
    doc.text("Agent", 300, tableTop, { width: 100, continued: true });
    doc.text("Status", 410, tableTop, { width: 80, continued: true });
    doc.text("Booked On", 500, tableTop, { width: 60 });

    // Draw a line under headers
    doc.moveTo(30, doc.y).lineTo(565, doc.y).stroke();
    doc.moveDown(0.5);

    // Table rows
    parcels.forEach((p) => {
      const rowY = doc.y;
      doc.text(p._id.toString(), 30, rowY, { width: 150, continued: true });
      doc.text(p.customer ? p.customer.name : "N/A", 190, rowY, {
        width: 100,
        continued: true,
      });
      doc.text(
        p.deliveryAgent ? p.deliveryAgent.name : "Unassigned",
        300,
        rowY,
        { width: 100, continued: true }
      );
      doc.text(p.status, 410, rowY, { width: 80, continued: true });
      doc.text(p.createdAt.toLocaleDateString(), 500, rowY, { width: 60 });
      doc.moveDown(1.5);
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: "Failed to generate PDF report" });
  }
};

module.exports = {
  getAllParcels,
  assignAgent,
  getDashboardMetrics,
  getAllUsers,
  exportCsvReport,
  exportPdfReport,
};
