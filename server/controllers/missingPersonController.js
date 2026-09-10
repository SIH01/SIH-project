const { getAll, getById, create, updateStatus, getOrganizationQueue, updateByOrganization } = require("../models/missingPersonModel");
const { getByUserId } = require("../models/organizationModel");
const { logAdminAction } = require("../utils/auditLog");

const STATUSES = ["Reported", "Under Review", "Searching", "Located", "Closed"];
const ESCALATION_STATUSES = ["none", "escalated", "resolved"];

function validateInput(body) {
  const errors = [];
  if (!body.reporter_name || !body.reporter_name.trim()) errors.push("Your name is required.");
  if (!body.reporter_contact || !body.reporter_contact.trim()) errors.push("A contact method is required.");
  if (!body.person_name || !body.person_name.trim()) errors.push("The missing person's name is required.");
  if (!body.last_known_location || !body.last_known_location.trim()) errors.push("Last known location is required.");
  if (!body.date_last_seen) errors.push("Date last seen is required.");
  if (body.age != null && (Number.isNaN(body.age) || body.age < 0 || body.age > 149)) {
    errors.push("Age must be a realistic number.");
  }
  return errors;
}

// POST /api/missing-persons — public. Reports go straight to review, never
// public — Section 14: "should NOT automatically become publicly searchable."
async function createReport(req, res) {
  const body = { ...req.body, age: req.body.age != null ? parseInt(req.body.age, 10) : null };
  const errors = validateInput(body);
  if (errors.length) return res.status(400).json({ error: errors.join(" ") });

  try {
    const report = await create(body);
    res.status(201).json({ report: { id: report.id, status: report.status } });
  } catch (err) {
    console.error("createReport error:", err.message);
    res.status(500).json({ error: "Could not submit report." });
  }
}

// GET /api/missing-persons — admin only (authorized review, per spec).
async function listReports(req, res) {
  try {
    const reports = await getAll();
    res.json({ reports });
  } catch (err) {
    console.error("listReports error:", err.message);
    res.status(500).json({ error: "Could not load reports." });
  }
}

// GET /api/missing-persons/:id — admin only.
async function getReportById(req, res) {
  try {
    const report = await getById(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found." });
    res.json({ report });
  } catch (err) {
    console.error("getReportById error:", err.message);
    res.status(500).json({ error: "Could not load report." });
  }
}

// PUT /api/missing-persons/:id — admin only, status triage.
async function updateReport(req, res) {
  const { status } = req.body;
  if (!STATUSES.includes(status)) {
    return res.status(400).json({ error: "Status must be one of: " + STATUSES.join(", ") });
  }
  try {
    const report = await updateStatus(req.params.id, status);
    if (!report) return res.status(404).json({ error: "Report not found." });
    await logAdminAction(req.user.id, "missing_person.review", "missing_person_report", report.id, status);
    res.json({ report });
  } catch (err) {
    console.error("updateReport error:", err.message);
    res.status(500).json({ error: "Could not update report." });
  }
}

async function verifiedOrganization(req, res) {
  const organization = await getByUserId(req.user.id);
  if (!organization || organization.verification_status !== "Verified") {
    res.status(403).json({ error: "A verified organization account is required." });
    return null;
  }
  return organization;
}

async function listOrganizationReports(req, res) {
  try {
    const organization = await verifiedOrganization(req, res);
    if (!organization) return;
    res.json({ reports: await getOrganizationQueue() });
  } catch (err) {
    console.error("listOrganizationReports error:", err.message);
    res.status(500).json({ error: "Could not load missing-person cases." });
  }
}

async function getOrganizationReport(req, res) {
  try {
    const organization = await verifiedOrganization(req, res);
    if (!organization) return;
    const report = await getById(req.params.id);
    if (!report || report.status === "Closed") return res.status(404).json({ error: "Open report not found." });
    res.json({ report });
  } catch (err) {
    console.error("getOrganizationReport error:", err.message);
    res.status(500).json({ error: "Could not load missing-person case." });
  }
}

async function updateOrganizationReport(req, res) {
  const { status, escalation_status } = req.body || {};
  if (status && !STATUSES.includes(status)) return res.status(400).json({ error: "Invalid missing-person status." });
  if (escalation_status && !ESCALATION_STATUSES.includes(escalation_status)) return res.status(400).json({ error: "Invalid escalation status." });
  if (status === "Closed") return res.status(403).json({ error: "Organizations cannot close missing-person cases." });
  try {
    const organization = await verifiedOrganization(req, res);
    if (!organization) return;
    const report = await updateByOrganization(req.params.id, organization.id, req.body);
    if (!report) return res.status(404).json({ error: "Open report not found." });
    res.json({ report });
  } catch (err) {
    console.error("updateOrganizationReport error:", err.message);
    res.status(500).json({ error: "Could not update missing-person case." });
  }
}

module.exports = {
  createReport, listReports, getReportById, updateReport,
  listOrganizationReports, getOrganizationReport, updateOrganizationReport, STATUSES,
};
