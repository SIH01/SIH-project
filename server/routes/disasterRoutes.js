const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const {
  listDisasters, activeCount, getNearbyDisasters, getDisasterById,
  createDisaster, updateDisaster, changeDisasterStatus, extendDisaster, deleteDisaster,
} = require("../controllers/disasterController");

function requireAdminForActiveQuery(req, res, next) {
  if (req.query.status === "active") return requireAuth(req, res, () => requireRole("admin")(req, res, next));
  next();
}

// /nearby must be registered before /:id, or Express treats "nearby" as an id.
router.get("/nearby", getNearbyDisasters);
router.get("/active-count", activeCount);
router.get("/:id", getDisasterById);
router.get("/", requireAdminForActiveQuery, listDisasters);

router.post("/", requireAuth, requireRole("admin"), createDisaster);
router.patch("/:id/status", requireAuth, requireRole("admin"), changeDisasterStatus);
router.patch("/:id/extend", requireAuth, requireRole("admin"), extendDisaster);
router.put("/:id", requireAuth, requireRole("admin"), updateDisaster);
router.patch("/:id", requireAuth, requireRole("admin"), updateDisaster);
router.delete("/:id", requireAuth, requireRole("admin"), deleteDisaster);

module.exports = router;