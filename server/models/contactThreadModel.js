const pool = require("../db/pool");

const THREAD_FIELDS = `
  t.id, t.tracking_id, t.organization_id, o.name as organization_name,
  t.requester_user_id, t.requester_name, t.requester_phone, t.requester_email,
  t.location_text, t.latitude, t.longitude, t.category, t.urgency, t.status,
  t.attachment_url, t.created_at, t.updated_at`;

async function create(data) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const inserted = await client.query(
      `insert into contact_threads
       (tracking_id, organization_id, requester_user_id, requester_name, requester_phone,
        requester_email, location_text, latitude, longitude, category, urgency, attachment_url)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) returning id`,
      [data.trackingId, data.organizationId, data.requesterUserId || null, data.requesterName,
        data.phone || null, data.email || null, data.location || null, data.latitude ?? null,
        data.longitude ?? null, data.category, data.urgency, data.attachmentUrl || null]
    );
    await client.query(
      `insert into contact_messages (thread_id, sender_role, sender_user_id, body, attachment_url)
       values ($1, 'citizen', $2, $3, $4)`,
      [inserted.rows[0].id, data.requesterUserId || null, data.message, data.attachmentUrl || null]
    );
    await client.query("COMMIT");
    return getById(inserted.rows[0].id);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function getById(id) {
  const { rows } = await pool.query(`select ${THREAD_FIELDS} from contact_threads t join organizations o on o.id = t.organization_id where t.id = $1`, [id]);
  if (!rows[0]) return null;
  const messages = await pool.query(
    `select id, sender_role, sender_user_id, body, attachment_url, created_at from contact_messages where thread_id = $1 order by created_at`,
    [id]
  );
  return { ...rows[0], messages: messages.rows };
}

async function listForOrganization(organizationId, filters = {}) {
  const values = [organizationId];
  const where = ["t.organization_id = $1"];
  for (const field of ["status", "category", "urgency"]) {
    if (filters[field]) { values.push(filters[field]); where.push(`t.${field} = $${values.length}`); }
  }
  const { rows } = await pool.query(`select ${THREAD_FIELDS} from contact_threads t join organizations o on o.id = t.organization_id where ${where.join(" and ")} order by t.updated_at desc`, values);
  return rows;
}

async function listForRequester(userId, trackingId) {
  const values = trackingId ? [trackingId] : [userId];
  const predicate = trackingId ? "t.tracking_id = $1" : "t.requester_user_id = $1";
  const { rows } = await pool.query(`select ${THREAD_FIELDS} from contact_threads t join organizations o on o.id = t.organization_id where ${predicate} order by t.updated_at desc`, values);
  return rows;
}

async function addMessage(id, data) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`insert into contact_messages (thread_id, sender_role, sender_user_id, body, attachment_url) values ($1,$2,$3,$4,$5)`, [id, data.senderRole, data.senderUserId || null, data.body, data.attachmentUrl || null]);
    await client.query(`update contact_threads set status = case when $1 = 'organization' and status = 'Pending' then 'Seen' else status end, updated_at = now() where id = $2`, [data.senderRole, id]);
    await client.query("COMMIT");
    return getById(id);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally { client.release(); }
}

async function updateStatus(id, status) {
  const { rows } = await pool.query(`update contact_threads set status = $1, updated_at = now() where id = $2 returning id`, [status, id]);
  return rows[0] ? getById(id) : null;
}

module.exports = { create, getById, listForOrganization, listForRequester, addMessage, updateStatus };
