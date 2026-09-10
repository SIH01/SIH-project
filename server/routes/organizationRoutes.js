const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const {
  register, listVerified, listAll, listPending, getMyOrganization, getOrganizationById, verifyOrganization,
  deleteOrganization,
} = require("../controllers/organizationController");

// Public
router.post("/register", register);
router.get("/", listVerified);

// Admin-only queue — must come before "/:id" or Express reads "admin" as an id.
router.get("/admin/all", requireAuth, requireRole("admin"), listAll);
router.get("/pending", requireAuth, requireRole("admin"), listPending);

// Organization's own profile — must also come before "/:id".
router.get("/me", requireAuth, requireRole("organization"), getMyOrganization);

router.get("/:id", getOrganizationById);
router.put("/:id/verify", requireAuth, requireRole("admin"), verifyOrganization);
router.patch("/:id/verify", requireAuth, requireRole("admin"), verifyOrganization);
router.delete("/:id", requireAuth, requireRole("admin"), deleteOrganization);

module.exports = router;
