const crypto = require("crypto");
const model = require("../models/contactThreadModel");
const { getById: getOrganization } = require("../models/organizationModel");
const { getByUserId } = require("../models/organizationModel");

const CATEGORIES = ["Food", "Water", "Medical", "Shelter", "Rescue", "Other"];
const URGENCIES = ["Low", "Medium", "High", "Critical"];
const STATUSES = ["Pending", "Seen", "In Progress", "Resolved"];

function trackingId() { return `DS-${crypto.randomBytes(4).toString("hex").toUpperCase()}`; }
function validCoordinates(body) {
  return (body.latitude == null || (Number.isFinite(Number(body.latitude)) && Number(body.latitude) >= -90 && Number(body.latitude) <= 90)) &&
    (body.longitude == null || (Number.isFinite(Number(body.longitude)) && Number(body.longitude) >= -180 && Number(body.longitude) <= 180));
}
async function verifiedOrganization(id) {
  const organization = await getOrganization(id);
  return organization && organization.verification_status === "Verified" ? organization : null;
}

async function createThread(req, res) {
  const body = req.body || {};
  if (!body.organization_id || !body.requester_name?.trim() || !body.category || !body.urgency || !body.message?.trim()) return res.status(400).json({ error: "Organization, name, category, urgency, and message are required." });
  if (!CATEGORIES.includes(body.category) || !URGENCIES.includes(body.urgency)) return res.status(400).json({ error: "Invalid category or urgency." });
  if (!validCoordinates(body)) return res.status(400).json({ error: "Location coordinates are invalid." });
  try {
    const organization = await verifiedOrganization(body.organization_id);
    if (!organization) return res.status(404).json({ error: "That organization is not currently contactable." });
    const request = await model.create({
      trackingId: trackingId(), organizationId: organization.id, requesterUserId: req.user?.role === "user" ? req.user.id : null,
      requesterName: body.requester_name.trim(), phone: body.phone, email: body.email, location: body.location,
      latitude: body.latitude == null ? null : Number(body.latitude), longitude: body.longitude == null ? null : Number(body.longitude),
      category: body.category, urgency: body.urgency, message: body.message.trim(), attachmentUrl: body.attachment_url,
    });
    res.status(201).json({ request, tracking_id: request.tracking_id });
  } catch (error) { console.error("create contact thread error:", error.message); res.status(500).json({ error: "Could not create your help request." }); }
}

async function listMine(req, res) {
  try { res.json({ requests: await model.listForRequester(req.user?.id, req.query.tracking_id) }); }
  catch (error) { res.status(500).json({ error: "Could not load your requests." }); }
}
async function getMine(req, res) {
  try {
    const request = await model.getById(req.params.id);
    if (!request || (request.requester_user_id !== req.user?.id && request.tracking_id !== req.query.tracking_id)) return res.status(404).json({ error: "Request not found." });
    res.json({ request });
  } catch (error) { res.status(500).json({ error: "Could not load your request." }); }
}
async function orgContext(req, res) {
  const organization = await getByUserId(req.user.id);
  if (!organization || organization.verification_status !== "Verified") { res.status(403).json({ error: "A verified organization account is required." }); return null; }
  return organization;
}
async function listOrganization(req, res) {
  try { const organization = await orgContext(req, res); if (!organization) return; res.json({ requests: await model.listForOrganization(organization.id, req.query) }); }
  catch (error) { res.status(500).json({ error: "Could not load your inbox." }); }
}
async function getOrganizationThread(req, res) {
  try { const organization = await orgContext(req, res); if (!organization) return; const request = await model.getById(req.params.id); if (!request || request.organization_id !== organization.id) return res.status(404).json({ error: "Request not found." }); res.json({ request }); }
  catch (error) { res.status(500).json({ error: "Could not load the conversation." }); }
}
async function postMessage(req, res) {
  if (!req.body?.body?.trim()) return res.status(400).json({ error: "Message cannot be empty." });
  try {
    const organization = await orgContext(req, res); if (!organization) return;
    const request = await model.getById(req.params.id); if (!request || request.organization_id !== organization.id) return res.status(404).json({ error: "Request not found." });
    res.status(201).json({ request: await model.addMessage(request.id, { senderRole: "organization", senderUserId: req.user.id, body: req.body.body.trim(), attachmentUrl: req.body.attachment_url }) });
  } catch (error) { res.status(500).json({ error: "Could not send your reply." }); }
}
async function updateOrganizationStatus(req, res) {
  if (!STATUSES.includes(req.body?.status)) return res.status(400).json({ error: "Invalid request status." });
  try { const organization = await orgContext(req, res); if (!organization) return; const request = await model.getById(req.params.id); if (!request || request.organization_id !== organization.id) return res.status(404).json({ error: "Request not found." }); res.json({ request: await model.updateStatus(request.id, req.body.status) }); }
  catch (error) { res.status(500).json({ error: "Could not update request status." }); }
}
async function postCitizenMessage(req, res) {
  if (!req.body?.body?.trim()) return res.status(400).json({ error: "Message cannot be empty." });
  try { const request = await model.getById(req.params.id); if (!request || (request.requester_user_id !== req.user?.id && request.tracking_id !== req.query.tracking_id)) return res.status(404).json({ error: "Request not found." }); res.status(201).json({ request: await model.addMessage(request.id, { senderRole: "citizen", senderUserId: req.user?.id, body: req.body.body.trim() }) }); }
  catch (error) { res.status(500).json({ error: "Could not send your message." }); }
}

module.exports = { createThread, listMine, getMine, postCitizenMessage, listOrganization, getOrganizationThread, postMessage, updateOrganizationStatus };
