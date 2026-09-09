const express = require("express");
const router = express.Router();
const { requireAuth, requireRole, requireAdmin, requireApprovedOrg } = require("../middleware/authMiddleware");
const controller = require("../controllers/shelterController");

router.get("/", controller.nearby);
router.get("/mine", requireAuth, requireApprovedOrg, controller.listMine);
router.get("/pending", requireAdmin, controller.pending);
router.get("/all", requireAdmin, controller.all);
router.post("/", requireAuth, requireApprovedOrg, controller.create);
router.patch("/:id", requireAuth, requireApprovedOrg, controller.updateOwn);
router.patch("/:id/review", requireAdmin, controller.review);

module.exports = router;