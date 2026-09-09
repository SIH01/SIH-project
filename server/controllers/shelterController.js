const model = require("../models/shelterModel");

const APPROVAL_STATUSES = ["approved", "rejected"];
const OPERATIONAL_STATUSES = ["active", "full", "closed"];

function parseBody(body) {
  return { ...body, latitude: parseFloat(body.latitude), longitude: parseFloat(body.longitude), capacity: parseInt(body.capacity, 10), currentOccupancy: parseInt(body.currentOccupancy ?? body.current_occupancy ?? 0, 10), facilities: Array.isArray(body.facilities) ? body.facilities : [] };
}

function validate(body) {
  if (!body.name?.trim()) return "Shelter name is required.";
  if (!Number.isFinite(body.latitude) || body.latitude < -90 || body.latitude > 90) return "Latitude must be between -90 and 90.";
  if (!Number.isFinite(body.longitude) || body.longitude < -180 || body.longitude > 180) return "Longitude must be between -180 and 180.";
  if (!Number.isInteger(body.capacity) || body.capacity < 1) return "Capacity must be a positive number.";
  if (!Number.isInteger(body.currentOccupancy) || body.currentOccupancy < 0 || body.currentOccupancy > body.capacity) return "Occupancy must be between 0 and capacity.";
  return null;
}

async function nearby(req, res) {
  const lat = parseFloat(req.query.lat); const lng = parseFloat(req.query.lng); const radiusKm = parseFloat(req.query.radius || 25);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(radiusKm)) return res.status(400).json({ error: "lat, lng, and radius are required." });
  try { res.json({ shelters: await model.nearby({ lat, lng, radiusKm }) }); }
  catch (err) { console.error("shelter nearby error:", err.message); res.status(500).json({ error: "Could not load nearby shelters." }); }
}

async function create(req, res) {
  const body = parseBody(req.body); const error = validate(body);
  if (error) return res.status(400).json({ error });
  try { res.status(201).json({ shelter: await model.create({ ...body, addedBy: req.organization.id }) }); }
  catch (err) { res.status(500).json({ error: "Could not submit shelter." }); }
}

async function listMine(req, res) {
  try { res.json({ shelters: await model.listByOrg(req.organization.id) }); }
  catch (err) { res.status(500).json({ error: "Could not load your shelters." }); }
}

async function updateOwn(req, res) {
  const body = parseBody(req.body); const error = validate(body);
  if (error) return res.status(400).json({ error });
  try {
    const shelter = await model.updateOwn(req.params.id, req.organization.id, body);
    if (!shelter) return res.status(404).json({ error: "Shelter not found or not owned by your organization." });
    res.json({ shelter });
  } catch (err) { res.status(500).json({ error: "Could not update shelter." }); }
}

async function pending(req, res) {
  try { res.json({ shelters: await model.listPending() }); }
  catch (err) { res.status(500).json({ error: "Could not load pending shelters." }); }
}

async function all(req, res) {
  try { res.json({ shelters: await model.listAll() }); }
  catch (err) { res.status(500).json({ error: "Could not load shelters." }); }
}

async function review(req, res) {
  const approvalStatus = req.body.approvalStatus;
  if (!APPROVAL_STATUSES.includes(approvalStatus)) return res.status(400).json({ error: "Approval status must be approved or rejected." });
  try {
    const shelter = await model.review(req.params.id, req.user.id, approvalStatus, req.body.reviewNote);
    if (!shelter) return res.status(404).json({ error: "Shelter not found." });
    res.json({ shelter });
  } catch (err) { res.status(500).json({ error: "Could not review shelter." }); }
}

module.exports = { nearby, create, listMine, updateOwn, pending, all, review, OPERATIONAL_STATUSES };