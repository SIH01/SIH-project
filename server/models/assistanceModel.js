const pool = require("../db/pool");
const { haversineDistanceKm } = require("../utils/haversine");

const SELECT_FIELDS = `
  id, request_type, status, requester_name, contact_phone, contact_email,
  location_name, latitude, longitude, description, disaster_id, admin_notes,
  urgency, people_affected, assigned_organization_id, created_at, updated_at
`;

async function getAll() {
  const { rows } = await pool.query(
    `select ${SELECT_FIELDS} from assistance_requests order by created_at desc`
  );
  return rows;
}

async function getById(id) {
  const { rows } = await pool.query(
    `select ${SELECT_FIELDS} from assistance_requests where id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function create(data) {
  const {
    request_type, requester_name, contact_phone, contact_email,
    location_name, latitude, longitude, description, disaster_id,
    urgency, people_affected,
  } = data;
  const { rows } = await pool.query(
    `insert into assistance_requests
      (request_type, requester_name, contact_phone, contact_email,
       location_name, latitude, longitude, description, disaster_id, urgency, people_affected)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     returning ${SELECT_FIELDS}`,
    [request_type, requester_name, contact_phone || null, contact_email || null,
     location_name, latitude ?? null, longitude ?? null, description, disaster_id || null,
     urgency || "Medium", people_affected ?? null]
  );
  return rows[0];
}

// Admin-only update — status triage and notes, not the requester's own fields.
async function updateStatus(id, { status, admin_notes }) {
  const { rows } = await pool.query(
    `update assistance_requests set
       status = coalesce($1, status),
       admin_notes = coalesce($2, admin_notes),
       updated_at = now()
     where id = $3
     returning ${SELECT_FIELDS}`,
    [status || null, admin_notes ?? null, id]
  );
  return rows[0] || null;
}

// Called when an organization accepts/responds — links the org and moves
// status forward without touching admin_notes.
async function assignOrganization(id, organizationId, status) {
  const { rows } = await pool.query(
    `update assistance_requests set
       assigned_organization_id = $1,
       status = coalesce($2, status),
       updated_at = now()
     where id = $3
     returning ${SELECT_FIELDS}`,
    [organizationId, status || null, id]
  );
  return rows[0] || null;
}

// Stage 7 matching: requests within radiusKm of an org's location that are
// still open (Pending or In Progress) and match one of the org's categories.
// Prototype-scale: pull unresolved rows and filter/sort in JS, same
// approach disasterModel.getNearby already uses.
async function getNearbyForOrg({ lat, lng, radiusKm = 50, categories = [] }) {
  const { rows } = await pool.query(
    `select ${SELECT_FIELDS} from assistance_requests where status != 'Resolved'`
  );
  return rows
    .filter((r) => r.latitude != null && r.longitude != null)
    .filter((r) => categories.length === 0 || categories.includes(r.request_type))
    .map((r) => ({
      ...r,
      distance_km: Math.round(haversineDistanceKm(lat, lng, r.latitude, r.longitude) * 10) / 10,
    }))
    .filter((r) => r.distance_km <= radiusKm)
    .sort((a, b) => a.distance_km - b.distance_km);
}

async function remove(id) {
  const { rowCount } = await pool.query("delete from assistance_requests where id=$1", [id]);
  return rowCount > 0;
}

module.exports = { getAll, getById, create, updateStatus, assignOrganization, getNearbyForOrg, remove };
