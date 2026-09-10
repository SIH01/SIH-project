const express = require("express");
const router = express.Router();
const { requireAuth, requireApprovedOrg } = require("../middleware/authMiddleware");

const controller = require("../controllers/orgMatchController");

// Every route here needs a verified org — requireApprovedOrg already
// attaches req.organization, same pattern shelterRoutes.js uses.
router.get("/nearby", requireAuth, requireApprovedOrg, controller.nearby);
router.get("/mine", requireAuth, requireApprovedOrg, controller.mine);
router.post("/:source/:id/claim", requireAuth, requireApprovedOrg, controller.claim);

module.exports = router;
