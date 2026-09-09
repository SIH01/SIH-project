const pool = require("../db/pool");

const SELECT_FIELDS = `
  id, organization_id, disaster_id, title, description, target_amount,
  amount_raised, purpose, location_name, supporting_documents,
  verification_status, status, created_at, updated_at
`;

// Public — only campaigns an admin has approved and made Active/Completed.
async function getPublic() {
  const { rows } = await pool.query(
    `select ${SELECT_FIELDS} from fundraising_campaigns
     where verification_status = 'Verified' and status in ('Active', 'Completed')
     order by created_at desc`
  );
  return rows;
}

async function getAll() {
  const { rows } = await pool.query(`select ${SELECT_FIELDS} from fundraising_campaigns order by created_at desc`);
  return rows;
}

async function getByOrganization(organizationId) {
  const { rows } = await pool.query(
    `select ${SELECT_FIELDS} from fundraising_campaigns where organization_id = $1 order by created_at desc`,
    [organizationId]
  );
  return rows;
}

async function getById(id) {
  const { rows } = await pool.query(`select ${SELECT_FIELDS} from fundraising_campaigns where id = $1`, [id]);
  return rows[0] || null;
}

async function create(data) {
  const {
    organization_id, disaster_id, title, description, target_amount,
    purpose, location_name, supporting_documents,
  } = data;
  const { rows } = await pool.query(
    `insert into fundraising_campaigns
      (organization_id, disaster_id, title, description, target_amount, purpose, location_name, supporting_documents)
     values ($1,$2,$3,$4,$5,$6,$7,$8)
     returning ${SELECT_FIELDS}`,
    [organization_id, disaster_id || null, title, description, target_amount,
     purpose || null, location_name || null, supporting_documents || null]
  );
  return rows[0];
}

// Admin-only — approve/reject sets verification_status; status tracks the
// campaign's own lifecycle once verified (Active/Completed/Suspended).
async function setVerification(id, verification_status, status) {
  const { rows } = await pool.query(
    `update fundraising_campaigns set
       verification_status = $1,
       status = coalesce($2, status),
       updated_at = now()
     where id = $3
     returning ${SELECT_FIELDS}`,
    [verification_status, status || null, id]
  );
  return rows[0] || null;
}

// Manual amount-raised update (no real payment processing in this
// prototype, per spec — this is the seam a real payment provider plugs into).
async function addToAmountRaised(id, amount) {
  const { rows } = await pool.query(
    `update fundraising_campaigns set amount_raised = amount_raised + $1, updated_at = now()
     where id = $2 returning ${SELECT_FIELDS}`,
    [amount, id]
  );
  return rows[0] || null;
}

module.exports = { getPublic, getAll, getByOrganization, getById, create, setVerification, addToAmountRaised };
