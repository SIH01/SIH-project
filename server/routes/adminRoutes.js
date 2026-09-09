const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const { getStats, getAuditLogs } = require("../controllers/adminController");

router.get("/stats", requireAuth, requireRole("admin"), getStats);
router.get("/audit-logs", requireAuth, requireRole("admin"), getAuditLogs);

module.exports = router;
