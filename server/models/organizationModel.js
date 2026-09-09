const pool = require("../db/pool");

const SELECT_FIELDS = `
  id, user_id, name, type, description, website, email, phone, address,
  operating_areas, latitude, longitude, assistance_categories,
  verification_status, documents, representative_name, representative_contact,
  created_at, verified_at
`;

// Public directory — verified organizations only.
async function getVerified() {
  const { rows } = await pool.query(
    `select ${SELECT_FIELDS} from organizations where verification_status = 'Verified' order by name`
  );
  return rows;
}

// Admin queue — every organization regardless of status.
async function getAll() {
  const { rows } = await pool.query(`select ${SELECT_FIELDS} from organizations order by created_at desc`);
  return rows;
}

async function getById(id) {
  const { rows } = await pool.query(`select ${SELECT_FIELDS} from organizations where id = $1`, [id]);
  return rows[0] || null;
}

async function getByUserId(userId) {
  const { rows } = await pool.query(`select ${SELECT_FIELDS} from organizations where user_id = $1`, [userId]);
  return rows[0] || null;
}

async function create(data) {
  const {
    userId, name, type, description, website, email, phone, address,
    operating_areas, latitude, longitude, assistance_categories,
    documents, representative_name, representative_contact,
  } = data;
  const { rows } = await pool.query(
    `insert into organizations
      (user_id, name, type, description, website, email, phone, address,
       operating_areas, latitude, longitude, assistance_categories,
       documents, representative_name, representative_contact)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
     returning ${SELECT_FIELDS}`,
    [userId, name, type, description || null, website || null, email, phone || null, address || null,
     operating_areas || null, latitude ?? null, longitude ?? null, assistance_categories || [],
     documents || null, representative_name || null, representative_contact || null]
  );
  return rows[0];
}

// Admin-only status transition. Sets verified_at the moment it becomes Verified.
async function setVerificationStatus(id, status) {
  const { rows } = await pool.query(
    `update organizations set
       verification_status = $1,
       verified_at = case when $1 = 'Verified' then now() else verified_at end
     where id = $2
     returning ${SELECT_FIELDS}`,
    [status, id]
  );
  return rows[0] || null;
}

module.exports = { getVerified, getAll, getById, getByUserId, create, setVerificationStatus };
