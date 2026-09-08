const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const {
  listDisasters, getNearbyDisasters, getDisasterById,
  createDisaster, updateDisaster, deleteDisaster,
} = require("../controllers/disasterController");

// /nearby must be registered before /:id, or Express treats "nearby" as an id.
router.get("/nearby", getNearbyDisasters);
router.get("/:id", getDisasterById);
router.get("/", listDisasters);

router.post("/", requireAuth, requireRole("admin"), createDisaster);
router.put("/:id", requireAuth, requireRole("admin"), updateDisaster);
router.delete("/:id", requireAuth, requireRole("admin"), deleteDisaster);

module.exports = router;