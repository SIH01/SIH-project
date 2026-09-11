const { getAll, getPublic, getById, create, updateStatus, remove } = require("../models/missingPersonModel");
const { logAdminAction } = require("../utils/auditLog");

const STATUSES = ["Reported", "Under Review", "Searching", "Located", "Closed"];

function validateInput(body) {
  const errors = [];
  if (!body.reporter_name || !body.reporter_name.trim()) errors.push("Your name is required.");
  if (!body.reporter_contact || !body.reporter_contact.trim()) errors.push("A contact method is required.");
  if (!body.person_name || !body.person_name.trim()) errors.push("The missing person's name is required.");
  if (!body.last_known_location || !body.last_known_location.trim()) errors.push("Last known location is required.");
  if (!body.date_last_seen) errors.push("Date last seen is required.");
  if (body.photo_url && !body.photo_url.startsWith("data:image/")) errors.push("Photo must be an image.");
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

// GET /api/missing-persons/public — public directory, without reporter details.
async function listPublicReports(req, res) {
  try {
    const reports = await getPublic();
    res.json({ reports });
  } catch (err) {
    console.error("listPublicReports error:", err.message);
    res.status(500).json({ error: "Could not load missing persons." });
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

// DELETE /api/missing-persons/:id — admin-only permanent removal.
async function deleteReport(req, res) {
  try {
    const report = await remove(req.params.id);
    if (!report) return res.status(404).json({ error: "Missing people report not found." });
    await logAdminAction(req.user.id, "missing_person.delete", "missing_person_report", report.id, report.person_name);
    res.json({ success: true });
  } catch (err) {
    console.error("deleteReport error:", err.message);
    res.status(500).json({ error: "Could not delete missing people report." });
  }
}

module.exports = { createReport, listReports, listPublicReports, getReportById, updateReport, deleteReport, STATUSES };
