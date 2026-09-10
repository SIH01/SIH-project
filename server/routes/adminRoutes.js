const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const { getStats, getAuditLogs } = require("../controllers/adminController");
const { adminAssign } = require("../controllers/organizationHelpController");

router.get("/stats", requireAuth, requireRole("admin"), getStats);
router.get("/audit-logs", requireAuth, requireRole("admin"), getAuditLogs);
router.patch("/help-requests/:id/assign", requireAuth, requireRole("admin"), adminAssign);

module.exports = router;
