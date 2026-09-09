const {
  getAll, getById, create, updateStatus, assignOrganization, getNearbyForOrg, remove,
} = require("../models/assistanceModel");
const { getByUserId } = require("../models/organizationModel");
const orgResponses = require("../models/organizationResponseModel");
const { logAdminAction } = require("../utils/auditLog");
// Note: assistance requests are submitted without an account (Section 5 —
// "No account required"), so there's no user_id to send an in-app
// notification to when an org responds. If accounts become required for
// requests later, wire notify(request.user_id, ...) in here.

const REQUEST_TYPES = [
  "Food", "Shelter", "Medical", "Mental Health",
  "Missing Person", "Financial", "Other",
];
const STATUSES = ["Pending", "In Progress", "Resolved"];
const URGENCIES = ["Low", "Medium", "High", "Critical"];
const RESPONSE_STATUSES = ["Accepted", "Assistance in Progress", "Assistance Provided", "Unable to Assist", "Closed"];
const DEFAULT_MATCH_RADIUS_KM = 50;

function validateRequestInput(body) {
  const errors = [];
  if (!REQUEST_TYPES.includes(body.request_type)) {
    errors.push("Request type must be one of: " + REQUEST_TYPES.join(", "));
  }
  if (!body.requester_name || !body.requester_name.trim()) errors.push("Name is required.");
  if (!body.location_name || !body.location_name.trim()) errors.push("Location is required.");
  if (!body.description || !body.description.trim()) errors.push("Description is required.");
  if (!body.contact_phone && !body.contact_email) {
    errors.push("A phone number or email is required so we can follow up.");
  }
  if (body.latitude != null && (Number.isNaN(body.latitude) || body.latitude < -90 || body.latitude > 90)) {
    errors.push("Latitude must be a number between -90 and 90.");
  }
  if (body.longitude != null && (Number.isNaN(body.longitude) || body.longitude < -180 || body.longitude > 180)) {
    errors.push("Longitude must be a number between -180 and 180.");
  }
  if (body.urgency && !URGENCIES.includes(body.urgency)) {
    errors.push("Urgency must be one of: " + URGENCIES.join(", "));
  }
  if (body.people_affected != null && (Number.isNaN(body.people_affected) || body.people_affected < 1)) {
    errors.push("Number of people affected must be a positive number.");
  }
  return errors;
}

// POST /api/assistance — public. Anyone can submit a request, no login needed.
async function createRequest(req, res) {
  const body = {
    ...req.body,
    latitude: req.body.latitude != null ? parseFloat(req.body.latitude) : null,
    longitude: req.body.longitude != null ? parseFloat(req.body.longitude) : null,
    people_affected: req.body.people_affected != null ? parseInt(req.body.people_affected, 10) : null,
  };
  const errors = validateRequestInput(body);
  if (errors.length) return res.status(400).json({ error: errors.join(" ") });

  try {
    const request = await create(body);
    res.status(201).json({ request });
  } catch (err) {
    console.error("createRequest error:", err.message);
    res.status(500).json({ error: "Could not submit request." });
  }
}

// GET /api/assistance — admin only, for triage.
async function listRequests(req, res) {
  try {
    const requests = await getAll();
    res.json({ requests });
  } catch (err) {
    console.error("listRequests error:", err.message);
    res.status(500).json({ error: "Could not load requests." });
  }
}

// GET /api/assistance/nearby-for-org — organization only, verified.
// Uses the org's own location + assistance_categories, default 50km radius
// (Section 19 of the spec: Affected Person <-> Nearby Verified Organization).
async function getNearbyForOrganization(req, res) {
  try {
    const org = await getByUserId(req.user.id);
    if (!org) return res.status(404).json({ error: "Organization profile not found." });
    if (org.verification_status !== "Verified") {
      return res.status(403).json({ error: "Your organization must be verified before viewing requests." });
    }
    if (org.latitude == null || org.longitude == null) {
      return res.status(400).json({ error: "Set your organization's location before viewing nearby requests." });
    }

    const radiusKm = req.query.radius ? parseFloat(req.query.radius) : DEFAULT_MATCH_RADIUS_KM;
    const requests = await getNearbyForOrg({
      lat: org.latitude, lng: org.longitude, radiusKm, categories: org.assistance_categories,
    });
    res.json({ requests, radius_km: radiusKm });
  } catch (err) {
    console.error("getNearbyForOrganization error:", err.message);
    res.status(500).json({ error: "Could not load nearby requests." });
  }
}

// GET /api/assistance/:id — admin only.
async function getRequestById(req, res) {
  try {
    const request = await getById(req.params.id);
    if (!request) return res.status(404).json({ error: "Request not found." });
    res.json({ request });
  } catch (err) {
    console.error("getRequestById error:", err.message);
    res.status(500).json({ error: "Could not load request." });
  }
}

// PUT /api/assistance/:id — admin only. Status + notes triage, not the
// requester's original fields (those stay as submitted, for accountability).
async function updateRequest(req, res) {
  const { status, admin_notes } = req.body;
  if (status && !STATUSES.includes(status)) {
    return res.status(400).json({ error: "Status must be one of: " + STATUSES.join(", ") });
  }
  try {
    const request = await updateStatus(req.params.id, { status, admin_notes });
    if (!request) return res.status(404).json({ error: "Request not found." });
    await logAdminAction(req.user.id, "assistance_request.update", "assistance_request", request.id, status || null);
    res.json({ request });
  } catch (err) {
    console.error("updateRequest error:", err.message);
    res.status(500).json({ error: "Could not update request." });
  }
}

// POST /api/assistance/:id/respond — organization only, verified.
// Records an OrganizationResponse and moves the request's own status
// forward to reflect it (Section 20 of the spec).
async function respondToRequest(req, res) {
  const { response, status } = req.body;
  if (!status || !RESPONSE_STATUSES.includes(status)) {
    return res.status(400).json({ error: "Status must be one of: " + RESPONSE_STATUSES.join(", ") });
  }
  try {
    const org = await getByUserId(req.user.id);
    if (!org) return res.status(404).json({ error: "Organization profile not found." });
    if (org.verification_status !== "Verified") {
      return res.status(403).json({ error: "Your organization must be verified before responding to requests." });
    }

    const request = await getById(req.params.id);
    if (!request) return res.status(404).json({ error: "Request not found." });

    const orgResponse = await orgResponses.create({
      organizationId: org.id, assistanceRequestId: request.id, response, status,
    });

    // Map the org's fine-grained status onto the request's own coarser status.
    const requestStatus =
      status === "Assistance Provided" || status === "Closed" ? "Resolved" :
      status === "Unable to Assist" ? request.status :
      "In Progress";
    const updated = await assignOrganization(request.id, org.id, requestStatus);

    res.status(201).json({ response: orgResponse, request: updated });
  } catch (err) {
    console.error("respondToRequest error:", err.message);
    res.status(500).json({ error: "Could not submit response." });
  }
}

// DELETE /api/assistance/:id — admin only.
async function deleteRequest(req, res) {
  try {
    const deleted = await remove(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Request not found." });
    res.json({ success: true });
  } catch (err) {
    console.error("deleteRequest error:", err.message);
    res.status(500).json({ error: "Could not delete request." });
  }
}

module.exports = {
  createRequest, listRequests, getRequestById, updateRequest, deleteRequest,
  getNearbyForOrganization, respondToRequest,
  REQUEST_TYPES, STATUSES, URGENCIES, RESPONSE_STATUSES,
};
