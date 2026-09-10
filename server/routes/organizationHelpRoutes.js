const express = require("express");
const router = express.Router();
const { requireAuth, requireOrgPortal } = require("../middleware/authMiddleware");
const controller = require("../controllers/organizationHelpController");
const { organizationLogin } = require("../controllers/authController");

router.post("/login", organizationLogin);
router.use(requireAuth, requireOrgPortal);
router.get("/dashboard/stats", controller.stats);
router.get("/requests", controller.list);
router.get("/requests/:id", controller.detail);
router.post("/requests/:id/claim", controller.claim);
router.post("/requests/:id/messages", controller.message);
router.patch("/requests/:id/status", controller.status);

module.exports = router;
