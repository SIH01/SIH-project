const express = require("express");
const router = express.Router();
const { optionalAuth } = require("../middleware/optionalAuth");
const { requireAuth, requireOrgPortal } = require("../middleware/authMiddleware");
const controller = require("../controllers/contactThreadController");

router.post("/", optionalAuth, controller.createThread);
router.get("/mine", optionalAuth, controller.listMine);
router.get("/mine/:id", optionalAuth, controller.getMine);
router.post("/mine/:id/messages", optionalAuth, controller.postCitizenMessage);
router.get("/organization", requireAuth, requireOrgPortal, controller.listOrganization);
router.get("/organization/:id", requireAuth, requireOrgPortal, controller.getOrganizationThread);
router.post("/organization/:id/messages", requireAuth, requireOrgPortal, controller.postMessage);
router.patch("/organization/:id/status", requireAuth, requireOrgPortal, controller.updateOrganizationStatus);

module.exports = router;
