const {
  getPublic, getAll, getByOrganization, getById, create, setVerification, addToAmountRaised,
} = require("../models/campaignModel");
const { getByUserId, getById: getOrgById } = require("../models/organizationModel");
const { logAdminAction } = require("../utils/auditLog");
const { notify } = require("../utils/notify");

const VERIFICATION_STATUSES = ["Pending Verification", "Pending Review", "Verified", "Approved", "Rejected"];
const STATUSES = ["Pending Verification", "Pending Review", "Active", "Approved", "Live", "Completed", "Rejected", "Suspended", "Closed"];

function validateInput(body) {
  const errors = [];
  if (!body.title || !body.title.trim()) errors.push("Campaign title is required.");
  if (!body.description || !body.description.trim()) errors.push("Description is required.");
  if (!body.target_amount || Number.isNaN(body.target_amount) || body.target_amount <= 0) {
    errors.push("Target amount must be a positive number.");
  }
  return errors;
}

// POST /api/campaigns — organization only, and only once verified
// (Section 17: "Create fundraising campaigns after verification").
async function createCampaign(req, res) {
  const body = { ...req.body, target_amount: parseFloat(req.body.target_amount) };
  const errors = validateInput(body);
  if (errors.length) return res.status(400).json({ error: errors.join(" ") });

  try {
    const org = await getByUserId(req.user.id);
    if (!org) return res.status(404).json({ error: "Organization profile not found." });
    if (org.verification_status !== "Verified") {
      return res.status(403).json({ error: "Your organization must be verified before creating campaigns." });
    }

    const campaign = await create({ ...body, organization_id: org.id });
    res.status(201).json({ campaign });
  } catch (err) {
    console.error("createCampaign error:", err.message);
    res.status(500).json({ error: "Could not create campaign." });
  }
}

// GET /api/campaigns — public, verified + Active/Completed only.
async function listPublicCampaigns(req, res) {
  try {
    const campaigns = await getPublic();
    res.json({ campaigns });
  } catch (err) {
    console.error("listPublicCampaigns error:", err.message);
    res.status(500).json({ error: "Could not load campaigns." });
  }
}

// GET /api/campaigns/admin/all — admin only, every status.
async function listAllCampaigns(req, res) {
  try {
    const campaigns = await getAll();
    res.json({ campaigns });
  } catch (err) {
    console.error("listAllCampaigns error:", err.message);
    res.status(500).json({ error: "Could not load campaigns." });
  }
}

// GET /api/campaigns/mine — organization only, its own campaigns of any status.
async function listMyCampaigns(req, res) {
  try {
    const org = await getByUserId(req.user.id);
    if (!org) return res.status(404).json({ error: "Organization profile not found." });
    const campaigns = await getByOrganization(org.id);
    res.json({ campaigns });
  } catch (err) {
    console.error("listMyCampaigns error:", err.message);
    res.status(500).json({ error: "Could not load your campaigns." });
  }
}

// GET /api/campaigns/:id — public.
async function getCampaignById(req, res) {
  try {
    const campaign = await getById(req.params.id);
    if (!campaign) return res.status(404).json({ error: "Campaign not found." });
    res.json({ campaign });
  } catch (err) {
    console.error("getCampaignById error:", err.message);
    res.status(500).json({ error: "Could not load campaign." });
  }
}

// PUT /api/campaigns/:id/verify — admin only. Approve/reject/suspend/complete.
async function verifyCampaign(req, res) {
  const { verification_status, status } = req.body;
  if (verification_status && !VERIFICATION_STATUSES.includes(verification_status)) {
    return res.status(400).json({ error: "Verification status must be one of: " + VERIFICATION_STATUSES.join(", ") });
  }
  if (status && !STATUSES.includes(status)) {
    return res.status(400).json({ error: "Status must be one of: " + STATUSES.join(", ") });
  }
  try {
    const existing = await getById(req.params.id);
    if (!existing) return res.status(404).json({ error: "Campaign not found." });

    // A verification_status of "Verified" with no explicit status also
    // activates the campaign, since that's the normal approve-and-go-live path.
    const nextVerification = verification_status === "Approved" || status === "Approved" || status === "Live"
      ? "Verified" : verification_status === "Pending Review" || status === "Pending Review"
        ? "Pending Verification" : verification_status || existing.verification_status;
    const nextStatus = status || (verification_status === "Verified" || verification_status === "Approved" ? "Active" : undefined);

    const campaign = await setVerification(req.params.id, nextVerification, nextStatus);
    await logAdminAction(req.user.id, "campaign.verify", "campaign", campaign.id, JSON.stringify({ verification_status, status }));

    const org = await getOrgById(campaign.organization_id);
    if (org?.user_id) {
      await notify(org.user_id, "Campaign status update", `"${campaign.title}" is now: ${campaign.status} (${campaign.verification_status}).`);
    }
    res.json({ campaign });
  } catch (err) {
    console.error("verifyCampaign error:", err.message);
    res.status(500).json({ error: "Could not update campaign." });
  }
}

// PUT /api/campaigns/:id/amount — admin or the owning organization can log
// funds received (manual — no live payment processing in this prototype).
// requireAuth alone doesn't distinguish "this org" from "any org", so that
// check happens here rather than in route middleware.
async function addAmount(req, res) {
  const amount = parseFloat(req.body.amount);
  if (Number.isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: "Amount must be a positive number." });
  }
  try {
    const existing = await getById(req.params.id);
    if (!existing) return res.status(404).json({ error: "Campaign not found." });

    if (req.user.role !== "admin") {
      const org = await getByUserId(req.user.id);
      if (!org || org.id !== existing.organization_id) {
        return res.status(403).json({ error: "You can only update your own organization's campaigns." });
      }
    }

    const campaign = await addToAmountRaised(req.params.id, amount);
    res.json({ campaign });
  } catch (err) {
    console.error("addAmount error:", err.message);
    res.status(500).json({ error: "Could not update amount raised." });
  }
}

module.exports = {
  createCampaign, listPublicCampaigns, listAllCampaigns, listMyCampaigns,
  getCampaignById, verifyCampaign, addAmount, VERIFICATION_STATUSES, STATUSES,
};
