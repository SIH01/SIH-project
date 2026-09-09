const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const {
  register, listVerified, listAll, getMyOrganization, getOrganizationById, verifyOrganization,
} = require("../controllers/organizationController");

// Public
router.post("/register", register);
router.get("/", listVerified);

// Admin-only queue — must come before "/:id" or Express reads "admin" as an id.
router.get("/admin/all", requireAuth, requireRole("admin"), listAll);

// Organization's own profile — must also come before "/:id".
router.get("/me", requireAuth, requireRole("organization"), getMyOrganization);

router.get("/:id", getOrganizationById);
router.put("/:id/verify", requireAuth, requireRole("admin"), verifyOrganization);

module.exports = router;
