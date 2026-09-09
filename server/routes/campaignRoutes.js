const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const {
  createCampaign, listPublicCampaigns, listAllCampaigns, listMyCampaigns,
  getCampaignById, verifyCampaign, addAmount,
} = require("../controllers/campaignController");

// Public
router.get("/", listPublicCampaigns);

// Must come before "/:id" or Express reads these as ids.
router.get("/admin/all", requireAuth, requireRole("admin"), listAllCampaigns);
router.get("/mine", requireAuth, requireRole("organization"), listMyCampaigns);

router.post("/", requireAuth, requireRole("organization"), createCampaign);
router.get("/:id", getCampaignById);
router.put("/:id/verify", requireAuth, requireRole("admin"), verifyCampaign);
router.put("/:id/amount", requireAuth, addAmount);

module.exports = router;
