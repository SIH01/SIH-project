const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const { createReport, listReports, listPublicReports, getReportById, updateReport, deleteReport } = require("../controllers/missingPersonController");

// Public — anyone can report, but the response never echoes back the full
// report (no reporter_contact, no other reports) — only the new id/status.
router.post("/", createReport);
router.get("/public", listPublicReports);

// Admin-only — reports are reviewed before any further visibility.
router.get("/", requireAuth, requireRole("admin"), listReports);
router.get("/:id", requireAuth, requireRole("admin"), getReportById);
router.put("/:id", requireAuth, requireRole("admin"), updateReport);
router.delete("/:id", requireAuth, requireRole("admin"), deleteReport);

module.exports = router;
