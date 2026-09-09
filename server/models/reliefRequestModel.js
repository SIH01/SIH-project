const pool = require("../db/pool");

const SELECT_FIELDS = `
  rr.id, rr.disaster_id, rr.name, rr.contact, rr.need_type, rr.description,
  rr.latitude, rr.longitude, rr.status, rr.created_at,
  d.name as disaster_name, d.location_name
`;

async function create(data) {
  const { rows } = await pool.query(
    `insert into relief_requests
      (disaster_id, name, contact, need_type, description, latitude, longitude)
     values ($1,$2,$3,$4,$5,$6,$7) returning *`,
    [data.disasterId || null, data.name, data.contact, data.needType, data.description,
      data.location?.lat ?? null, data.location?.lng ?? null]
  );
  return rows[0];
}

async function list(filters = {}) {
  const values = [];
  const where = [];
  if (filters.disasterId) { values.push(filters.disasterId); where.push(`rr.disaster_id = $${values.length}`); }
  if (filters.status) { values.push(filters.status); where.push(`rr.status = $${values.length}`); }
  if (filters.needType) { values.push(filters.needType); where.push(`rr.need_type = $${values.length}`); }
  const { rows } = await pool.query(
    `select ${SELECT_FIELDS} from relief_requests rr left join disasters d on d.id = rr.disaster_id
     ${where.length ? `where ${where.join(" and ")}` : ""} order by rr.created_at desc`, values
  );
  return rows;
}

async function updateStatus(id, status) {
  const { rows } = await pool.query(
    `update relief_requests set status = $1 where id = $2 returning *`, [status, id]
  );
  return rows[0] || null;
}

module.exports = { create, list, updateStatus };