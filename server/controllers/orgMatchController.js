const model = require("../models/orgMatchModel");

const DEFAULT_RADIUS_KM = 50;
const HELP_STATUSES = ["new", "in_review", "in_progress", "resolved", "closed"];
const RELIEF_STATUSES = ["pending", "in_progress", "resolved"];

// GET /api/org-matching/nearby — verified organization only. Section 18/19:
// nearby requests within a default 50km radius, computed from the org's
// own stored location (set at registration).
async function nearby(req, res) {
  const org = req.organization; // attached by requireApprovedOrg
  if (org.latitude == null || org.longitude == null) {
    return res.status(400).json({ error: "Set your organization's location before viewing nearby requests." });
  }
  const radiusKm = req.query.radius ? parseFloat(req.query.radius) : DEFAULT_RADIUS_KM;
  if (!Number.isFinite(radiusKm) || radiusKm <= 0) {
    return res.status(400).json({ error: "radius must be a positive number." });
  }
  try {
    const requests = await model.nearbyForOrg({ lat: org.latitude, lng: org.longitude, radiusKm, orgId: org.id });
    res.json({ requests, radius_km: radiusKm });
  } catch (err) {
    console.error("orgMatch nearby error:", err.message);
    res.status(500).json({ error: "Could not load nearby requests." });
  }
}

// GET /api/org-matching/mine — requests this org has already claimed.
async function mine(req, res) {
  try {
    const requests = await model.listClaimedByOrg(req.organization.id);
    res.json({ requests });
  } catch (err) {
    console.error("orgMatch mine error:", err.message);
    res.status(500).json({ error: "Could not load your claimed requests." });
  }
}

// POST /api/org-matching/:source/:id/claim — Section 20: organization
// response. source is "help_request" or "relief_request" (matches the
// `source` field nearbyForOrg/listClaimedByOrg already return, so the
// frontend never has to construct it).
async function claim(req, res) {
  const { source, id } = req.params;
  if (source !== "help_request" && source !== "relief_request") {
    return res.status(400).json({ error: "source must be help_request or relief_request." });
  }
  const validStatuses = source === "help_request" ? HELP_STATUSES : RELIEF_STATUSES;
  if (req.body.status && !validStatuses.includes(req.body.status)) {
    return res.status(400).json({ error: "Status must be one of: " + validStatuses.join(", ") });
  }
  // Default first-claim status if the caller didn't specify one.
  const status = req.body.status || "in_progress";
  try {
    const updated = await model.claimOrUpdate(source, id, req.organization.id, status);
    if (!updated) {
      return res.status(409).json({ error: "This request was not found, or has already been claimed by another organization." });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("orgMatch claim error:", err.message);
    res.status(500).json({ error: "Could not update this request." });
  }
}

module.exports = { nearby, mine, claim, DEFAULT_RADIUS_KM };
