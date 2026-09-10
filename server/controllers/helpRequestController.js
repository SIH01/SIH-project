const model = require("../models/helpRequestModel");

const TYPES = ["food", "shelter", "medical", "mental_health", "missing_person", "financial", "other"];
const URGENCIES = ["low", "medium", "critical"];
const STATUSES = ["new", "in_review", "in_progress", "resolved", "closed"];

function validate(body) {
  const errors = [];
  if (!TYPES.includes(body.type)) errors.push("Choose a valid help type.");
  if (!body.name?.trim()) errors.push("Name is required.");
  if (!body.phone?.trim() && !body.email?.trim()) errors.push("At least one phone number or email is required.");
  if (!body.location?.text?.trim() && (body.location?.lat == null || body.location?.lng == null)) errors.push("Add a location or attach your current location.");
  if (!body.description?.trim() || body.description.trim().length < 10) errors.push("Please describe what you need in at least 10 characters.");
  if (!URGENCIES.includes(body.urgency || "medium")) errors.push("Choose a valid urgency.");
  if (body.location?.lat != null && (Number.isNaN(Number(body.location.lat)) || Number(body.location.lat) < -90 || Number(body.location.lat) > 90)) errors.push("Latitude is invalid.");
  if (body.location?.lng != null && (Number.isNaN(Number(body.location.lng)) || Number(body.location.lng) < -180 || Number(body.location.lng) > 180)) errors.push("Longitude is invalid.");
  if (body.preferred_organization_id != null && (!Number.isInteger(Number(body.preferred_organization_id)) || Number(body.preferred_organization_id) <= 0)) errors.push("Preferred organization is invalid.");
  return errors;
}

async function create(req, res) {
  const errors = validate(req.body);
  if (errors.length) return res.status(400).json({ error: errors.join(" ") });
  try {
    const request = await model.create({ ...req.body, urgency: req.body.urgency || "medium" });
    res.status(201).json({ request, requestId: request.request_id });
  } catch (err) { console.error("help request create error:", err.message); res.status(500).json({ error: "Could not submit your help request." }); }
}

async function list(req, res) {
  try { res.json({ requests: await model.list(req.query) }); }
  catch (err) { console.error("help request list error:", err.message); res.status(500).json({ error: "Could not load help requests." }); }
}

async function update(req, res) {
  if (req.body.status && !STATUSES.includes(req.body.status)) return res.status(400).json({ error: "Invalid help request status." });
  try {
    const request = await model.update(req.params.id, req.body);
    if (!request) return res.status(404).json({ error: "Help request not found." });
    res.json({ request });
  } catch (err) { console.error("help request update error:", err.message); res.status(500).json({ error: "Could not update help request." }); }
}

module.exports = { create, list, update };