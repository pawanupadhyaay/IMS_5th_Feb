const { Product } = require("../models/Product");
const ActivityLog = require("../models/ActivityLog");
const { Readable } = require("stream");

// Helper function to escape CSV values
const escapeCSV = (value) => {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

// @desc    Export products to CSV (streaming - memory efficient for large datasets)
// @route   GET /api/export/csv
// @access  Private
const exportToCSV = async (req, res) => {
  try {
    const { brand, category, search } = req.query;

    // Build filter
    const filter = {};
    if (brand) filter.brand = new RegExp(`^${brand}$`, "i");
    if (category) filter.category = new RegExp(`^${category}$`, "i");
    if (search) {
      const searchRegex = new RegExp(search, "i");
      filter.$or = [
        { brand: searchRegex },
        { sku: searchRegex },
        { category: searchRegex },
        { description: searchRegex },
      ];
    }

    // Set response headers for streaming
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="inventory-export-${Date.now()}.csv"`
    );

    // CSV headers
    const headers = [
      "Brand",
      "SKU",
      "Category",
      "Inventory",
      "Price",
      "Total Value",
      "Description",
    ];

    // Write headers
    res.write(headers.map(escapeCSV).join(",") + "\n");

    // Stream products from database (memory efficient)
    const cursor = Product.find(filter)
      .select("brand sku category inventory price description")
      .lean()
      .cursor();

    let rowCount = 0;
    for await (const product of cursor) {
      const totalValue = (product.inventory || 0) * (product.price || 0);
      const row = [
        product.brand || "",
        product.sku || "",
        product.category || "",
        product.inventory || 0,
        product.price || 0,
        totalValue,
        product.description || "",
      ];

      res.write(row.map(escapeCSV).join(",") + "\n");
      rowCount++;

      // Flush every 100 rows to prevent buffer buildup
      if (rowCount % 100 === 0) {
        res.flushHeaders?.();
      }
    }

    res.end();
  } catch (error) {
    console.error("CSV Export Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    } else {
      res.end();
    }
  }
};

// @desc    Export activity logs to CSV (streaming - memory efficient for large datasets)
// @route   GET /api/export/activity-logs/csv
// @access  Private
const exportActivityLogsToCSV = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10000, // Large limit for export
      brand,
      action,
      actionType,
      admin,
      adminId,
      search,
      startDate,
      endDate,
    } = req.query;

    // Build dynamic filter object (same logic as getActivityLogs)
    const filter = {};

    if (brand) {
      filter.brand = new RegExp(`^${brand}$`, "i");
    }

    const actionFilter = action || actionType;
    if (actionFilter) {
      filter.actionType = actionFilter;
    }

    const adminFilter = admin || adminId;
    if (adminFilter) {
      filter.adminId = adminFilter;
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      filter.$or = [
        { brand: searchRegex },
        { sku: searchRegex },
      ];
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDateTime;
      }
    }

    // Set response headers for streaming
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="activity-logs-export-${Date.now()}.csv"`
    );

    // CSV headers
    const headers = [
      "Brand",
      "SKU",
      "Action",
      "Admin Name",
      "Admin Email",
      "Timestamp",
    ];

    // Write headers
    res.write(headers.map(escapeCSV).join(",") + "\n");

    // Stream activity logs from database (memory efficient)
    const cursor = ActivityLog.find(filter)
      .select("brand sku actionType adminName adminEmail createdAt")
      .sort({ createdAt: -1 })
      .lean()
      .cursor();

    let rowCount = 0;
    for await (const log of cursor) {
      const timestamp = log.createdAt
        ? new Date(log.createdAt).toISOString()
        : "";
      const row = [
        log.brand || "",
        log.sku || "",
        log.actionType || "",
        log.adminName || "",
        log.adminEmail || "",
        timestamp,
      ];

      res.write(row.map(escapeCSV).join(",") + "\n");
      rowCount++;

      // Flush every 100 rows to prevent buffer buildup
      if (rowCount % 100 === 0) {
        res.flushHeaders?.();
      }
    }

    res.end();
  } catch (error) {
    console.error("Activity Logs CSV Export Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    } else {
      res.end();
    }
  }
};

module.exports = {
  exportToCSV,
  exportActivityLogsToCSV,
};

