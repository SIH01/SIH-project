const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const {
  createRequest, listRequests, getRequestById, updateRequest, deleteRequest,
  getNearbyForOrganization, respondToRequest,
} = require("../controllers/assistanceController");

// Public — anyone in need can submit without an account.
router.post("/", createRequest);

// Organization-only — must come before "/:id" or Express reads "nearby-for-org" as an id.
router.get("/nearby-for-org", requireAuth, requireRole("organization"), getNearbyForOrganization);
router.post("/:id/respond", requireAuth, requireRole("organization"), respondToRequest);

// Admin-only — triage, review, and manage requests.
router.get("/", requireAuth, requireRole("admin"), listRequests);
router.get("/:id", requireAuth, requireRole("admin"), getRequestById);
router.put("/:id", requireAuth, requireRole("admin"), updateRequest);
router.delete("/:id", requireAuth, requireRole("admin"), deleteRequest);

module.exports = router;
