const {
  getAll, getActiveCount, getById, getNearby, create, update, updateStatus, extendActive, remove,
} = require("../models/disasterModel");
const { haversineDistanceKm } = require("../utils/haversine");
const { logAdminAction } = require("../utils/auditLog");

const TYPES = [
  "Flood", "Earthquake", "Cyclone", "Tsunami", "Landslide", "Wildfire",
  "Drought", "Extreme Heat", "Extreme Cold", "Avalanche", "Storm",
  "Volcanic Eruption", "Other",
];
const STATUSES = ["Historical", "Current", "Forecast", "Resolved"];
const ALERT_STATUSES = ["active", "historical", "resolved"];
const SEVERITIES = ["Low", "Moderate", "High", "Severe"];
const DEFAULT_RADIUS_KM = 50;

function storageStatus(status) {
  return status === "active" ? "Current" : status === "historical" ? "Historical" : status === "resolved" ? "Resolved" : status;
}

function validateDisasterInput(body) {
  const errors = [];
  if (!body.name || !body.name.trim()) errors.push("Name is required.");
  if (!TYPES.includes(body.type)) errors.push("Type must be one of: " + TYPES.join(", "));
  if (!STATUSES.includes(body.status) && !ALERT_STATUSES.includes(body.status)) errors.push("Status must be one of: " + STATUSES.concat(ALERT_STATUSES).join(", "));
  if (!SEVERITIES.includes(body.severity)) errors.push("Severity must be one of: " + SEVERITIES.join(", "));
  if (!body.date) errors.push("Date is required.");
  if (typeof body.latitude !== "number" || Number.isNaN(body.latitude) || body.latitude < -90 || body.latitude > 90)
    errors.push("Latitude must be a number between -90 and 90.");
  if (typeof body.longitude !== "number" || Number.isNaN(body.longitude) || body.longitude < -180 || body.longitude > 180)
    errors.push("Longitude must be a number between -180 and 180.");
  if (!body.location_name || !body.location_name.trim()) errors.push("Location name is required.");
  return errors;
}

async function listDisasters(req, res) {
  try {
    const disasters = await getAll(req.query.status);
    res.json({ disasters });
  } catch (err) {
    console.error("listDisasters error:", err.message);
    res.status(500).json({ error: "Could not load disasters." });
  }
}

async function activeCount(req, res) {
  try { res.json({ count: await getActiveCount(), updatedAt: new Date().toISOString() }); }
  catch (err) { console.error("activeCount error:", err.message); res.status(500).json({ error: "Could not load active alert count." }); }
}

async function getNearbyDisasters(req, res) {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  const radiusKm = req.query.radius ? parseFloat(req.query.radius) : DEFAULT_RADIUS_KM;

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return res.status(400).json({ error: "lat and lng query params are required." });
  }

  try {
    const disasters = await getNearby({ lat, lng, radiusKm });
    res.json({ disasters, radius_km: radiusKm, center: { lat, lng } });
  } catch (err) {
    console.error("getNearbyDisasters error:", err);
    res.status(500).json({ error: "Could not load nearby disasters." });
  }
}

async function getDisasterById(req, res) {
  try {
    const disaster = await getById(req.params.id);
    if (!disaster) return res.status(404).json({ error: "Disaster not found." });

    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      disaster.distance_km = Math.round(haversineDistanceKm(lat, lng, disaster.latitude, disaster.longitude) * 10) / 10;
    }
    res.json({ disaster });
  } catch (err) {
    console.error("getDisasterById error:", err.message);
    res.status(500).json({ error: "Could not load disaster." });
  }
}

async function createDisaster(req, res) {
  const body = { ...req.body, status: storageStatus(req.body.status || "active"), latitude: parseFloat(req.body.latitude), longitude: parseFloat(req.body.longitude) };
  const errors = validateDisasterInput(body);
  if (errors.length) return res.status(400).json({ error: errors.join(" ") });

  try {
    const disaster = await create({ ...body, createdBy: req.user.id });
    await logAdminAction(req.user.id, "disaster.create", "disaster", disaster.id, disaster.name);
    res.status(201).json({ disaster });
  } catch (err) {
    console.error("createDisaster error:", err.message);
    res.status(500).json({ error: "Could not create disaster." });
  }
}

async function updateDisaster(req, res) {
  const body = { ...req.body, status: storageStatus(req.body.status), latitude: parseFloat(req.body.latitude), longitude: parseFloat(req.body.longitude) };
  const errors = validateDisasterInput(body);
  if (errors.length) return res.status(400).json({ error: errors.join(" ") });

  try {
    const disaster = await update(req.params.id, body);
    if (!disaster) return res.status(404).json({ error: "Disaster not found." });
    await logAdminAction(req.user.id, "disaster.update", "disaster", disaster.id, disaster.name);
    res.json({ disaster });
  } catch (err) {
    console.error("updateDisaster error:", err.message);
    res.status(500).json({ error: "Could not update disaster." });
  }
}

async function changeDisasterStatus(req, res) {
  const requested = req.body.status;
  if (!ALERT_STATUSES.includes(requested)) return res.status(400).json({ error: "Status must be active, historical, or resolved." });
  try {
    const disaster = await updateStatus(req.params.id, storageStatus(requested), requested === "active" ? req.body.activeUntil : null, req.user.id);
    if (!disaster) return res.status(404).json({ error: "Disaster not found." });
    res.json({ disaster });
  } catch (err) { console.error("changeDisasterStatus error:", err.message); res.status(500).json({ error: "Could not update alert status." }); }
}

async function extendDisaster(req, res) {
  const activeUntil = new Date(req.body.activeUntil);
  if (Number.isNaN(activeUntil.getTime())) return res.status(400).json({ error: "A valid activeUntil date is required." });
  try {
    const disaster = await extendActive(req.params.id, activeUntil.toISOString(), req.user.id);
    if (!disaster) return res.status(404).json({ error: "Disaster not found." });
    res.json({ disaster });
  } catch (err) { console.error("extendDisaster error:", err.message); res.status(500).json({ error: "Could not extend alert." }); }
}

async function deleteDisaster(req, res) {
  try {
    const deleted = await remove(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Disaster not found." });
    await logAdminAction(req.user.id, "disaster.delete", "disaster", req.params.id, null);
    res.json({ success: true });
  } catch (err) {
    console.error("deleteDisaster error:", err.message);
    res.status(500).json({ error: "Could not delete disaster." });
  }
}

module.exports = {
  listDisasters, activeCount, getNearbyDisasters, getDisasterById,
  createDisaster, updateDisaster, changeDisasterStatus, extendDisaster, deleteDisaster,
  TYPES, STATUSES, SEVERITIES,
};