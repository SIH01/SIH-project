const pool = require("../db/pool");

const SELECT_FIELDS = `
  h.id, h.request_id, h.type, h.name, h.phone, h.email, h.location_text,
  h.latitude, h.longitude, h.description, h.urgency, h.status,
  h.assigned_to, h.preferred_organization_id, h.attachments, h.created_at, h.updated_at,
  u.name as assigned_name, u.role as assigned_role
`;

async function create(data) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const inserted = await client.query(
      `insert into help_requests
        (type, name, phone, email, location_text, latitude, longitude, description, urgency, attachments,
         preferred_organization_id)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) returning id`,
      [data.type, data.name, data.phone || null, data.email || null, data.location?.text || null,
        data.location?.lat ?? null, data.location?.lng ?? null, data.description, data.urgency || "medium",
        data.attachments || [], data.preferred_organization_id || null]
    );
    const requestId = `GH-${String(2000 + inserted.rows[0].id).padStart(4, "0")}`;
    await client.query("update help_requests set request_id = $1 where id = $2", [requestId, inserted.rows[0].id]);
    await client.query("COMMIT");
    const { rows } = await pool.query(`select ${SELECT_FIELDS} from help_requests h left join users u on u.id = h.assigned_to where h.id = $1`, [inserted.rows[0].id]);
    return rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally { client.release(); }
}

async function list(filters = {}) {
  const values = []; const where = [];
  if (filters.type) { values.push(filters.type); where.push(`h.type = $${values.length}`); }
  if (filters.urgency) { values.push(filters.urgency); where.push(`h.urgency = $${values.length}`); }
  if (filters.status) { values.push(filters.status); where.push(`h.status = $${values.length}`); }
  const order = filters.sort === "urgency" ? "case h.urgency when 'critical' then 1 when 'medium' then 2 else 3 end, h.created_at desc" : "h.created_at desc";
  const { rows } = await pool.query(`select ${SELECT_FIELDS} from help_requests h left join users u on u.id = h.assigned_to ${where.length ? `where ${where.join(" and ")}` : ""} order by ${order}`, values);
  return rows;
}

async function update(id, data) {
  const values = [data.status || null];
  const assignments = ["status = coalesce($1, status)"];
  if (Object.prototype.hasOwnProperty.call(data, "assignedTo")) {
    values.push(data.assignedTo || null);
    assignments.push(`assigned_to = $${values.length}`);
  }
  values.push(id);
  const { rows } = await pool.query(
    `update help_requests set ${assignments.join(", ")}, updated_at = now()
     where id = $${values.length} returning *`, values
  );
  return rows[0] || null;
}

module.exports = { create, list, update };