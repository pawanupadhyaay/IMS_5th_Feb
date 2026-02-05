const express = require("express");
const router = express.Router();
const { exportToCSV, exportActivityLogsToCSV } = require("../controllers/exportController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/csv", exportToCSV);
router.get("/activity-logs/csv", exportActivityLogsToCSV);

module.exports = router;

