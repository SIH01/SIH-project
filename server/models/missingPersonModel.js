const pool = require("../db/pool");

const SELECT_FIELDS = `
  id, reporter_name, reporter_contact, disaster_id, person_name, age,
  last_known_location, date_last_seen, description, additional_information,
  status, findings, tips, escalation_status, escalation_notes,
  managed_by_organization_id, managed_updated_at, created_at, updated_at
`;

async function getAll() {
  const { rows } = await pool.query(
    `select ${SELECT_FIELDS} from missing_person_reports order by created_at desc`
  );
  return rows;
}

async function getById(id) {
  const { rows } = await pool.query(
    `select ${SELECT_FIELDS} from missing_person_reports where id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function create(data) {
  const {
    reporter_name, reporter_contact, disaster_id, person_name, age,
    last_known_location, date_last_seen, description, additional_information,
  } = data;
  const { rows } = await pool.query(
    `insert into missing_person_reports
      (reporter_name, reporter_contact, disaster_id, person_name, age,
       last_known_location, date_last_seen, description, additional_information)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     returning ${SELECT_FIELDS}`,
    [reporter_name, reporter_contact, disaster_id || null, person_name, age ?? null,
     last_known_location, date_last_seen, description || null, additional_information || null]
  );
  return rows[0];
}

// Admin/authorized review only — reports are not publicly searchable
// (Section 14 of the spec), so there is no public update path.
async function updateStatus(id, status) {
  const { rows } = await pool.query(
    `update missing_person_reports set status = $1, updated_at = now()
     where id = $2 returning ${SELECT_FIELDS}`,
    [status, id]
  );
  return rows[0] || null;
}

async function getOrganizationQueue() {
  const { rows } = await pool.query(
    `select ${SELECT_FIELDS} from missing_person_reports
     where status <> 'Closed' order by created_at desc`
  );
  return rows;
}

async function updateByOrganization(id, organizationId, data) {
  const values = [data.status || null, data.findings ?? null, data.tips ?? null,
    data.escalation_status || null, data.escalation_notes ?? null, organizationId, id];
  const { rows } = await pool.query(
    `update missing_person_reports set
       status = coalesce($1, status), findings = coalesce($2, findings),
       tips = coalesce($3, tips), escalation_status = coalesce($4, escalation_status),
       escalation_notes = coalesce($5, escalation_notes),
       managed_by_organization_id = coalesce(managed_by_organization_id, $6),
       managed_updated_at = now(), updated_at = now()
     where id = $7 and status <> 'Closed'
     returning ${SELECT_FIELDS}`, values
  );
  return rows[0] || null;
}

module.exports = { getAll, getById, create, updateStatus, getOrganizationQueue, updateByOrganization };
