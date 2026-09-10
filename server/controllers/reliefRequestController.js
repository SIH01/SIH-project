const model = require("../models/reliefRequestModel");

const NEED_TYPES = ["food", "water", "medical", "shelter", "rescue", "other"];
const STATUSES = ["pending", "in_progress", "resolved"];

async function create(req, res) {
  const { disasterId, name, contact, needType, description, location } = req.body;
  if (!name?.trim() || !contact?.trim() || !NEED_TYPES.includes(needType) || !description?.trim()) {
    return res.status(400).json({ error: "Name, contact, need type, and description are required." });
  }
  try { res.status(201).json({ request: await model.create({ disasterId, name, contact, needType, description, location }) }); }
  catch (err) { console.error("relief request create error:", err.message); res.status(500).json({ error: "Could not submit relief request." }); }
}

async function list(req, res) {
  try { res.json({ requests: await model.list(req.query) }); }
  catch (err) { console.error("relief request list error:", err.message); res.status(500).json({ error: "Could not load relief requests." }); }
}

async function update(req, res) {
  if (!STATUSES.includes(req.body.status)) return res.status(400).json({ error: "Invalid relief request status." });
  try {
    const request = await model.updateStatus(req.params.id, req.body.status);
    if (!request) return res.status(404).json({ error: "Relief request not found." });
    res.json({ request });
  } catch (err) { console.error("relief request update error:", err.message); res.status(500).json({ error: "Could not update relief request." }); }
}

module.exports = { create, list, update, NEED_TYPES, STATUSES };