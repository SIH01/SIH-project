const pool = require("../db/pool");

const SELECT_FIELDS = `
  id, organization_id, disaster_id, title, description, target_amount,
  amount_raised, purpose, location_name, supporting_documents,
  verification_status, status, end_date, created_at, updated_at
`;

// Public — only campaigns an admin has approved and made Active/Completed.
async function getPublic() {
  const { rows } = await pool.query(
    `select ${SELECT_FIELDS} from fundraising_campaigns
     where verification_status = 'Verified' and status in ('Active', 'Approved', 'Live', 'Completed')
     order by created_at desc`
  );
  return rows.map(withAnalytics);
}

async function getAll() {
  const { rows } = await pool.query(`select ${SELECT_FIELDS} from fundraising_campaigns order by created_at desc`);
  return rows.map(withAnalytics);
}

async function getByOrganization(organizationId) {
  const { rows } = await pool.query(
    `select ${SELECT_FIELDS} from fundraising_campaigns where organization_id = $1 order by created_at desc`,
    [organizationId]
  );
  return rows.map(withAnalytics);
}

async function getById(id) {
  const { rows } = await pool.query(`select ${SELECT_FIELDS} from fundraising_campaigns where id = $1`, [id]);
  return rows[0] ? withAnalytics(rows[0]) : null;
}

async function create(data) {
  const {
    organization_id, disaster_id, title, description, target_amount,
    purpose, location_name, supporting_documents, end_date,
  } = data;
  const { rows } = await pool.query(
    `insert into fundraising_campaigns
      (organization_id, disaster_id, title, description, target_amount, purpose, location_name, supporting_documents, end_date)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     returning ${SELECT_FIELDS}`,
    [organization_id, disaster_id || null, title, description, target_amount,
     purpose || null, location_name || null, supporting_documents || null, end_date || null]
  );
  return rows[0] ? withAnalytics(rows[0]) : null;
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
  return rows[0] ? withAnalytics(rows[0]) : null;
}

// Manual amount-raised update (no real payment processing in this
// prototype, per spec — this is the seam a real payment provider plugs into).
async function addToAmountRaised(id, amount) {
  const { rows } = await pool.query(
    `update fundraising_campaigns set amount_raised = amount_raised + $1, updated_at = now()
     where id = $2 returning ${SELECT_FIELDS}`,
    [amount, id]
  );
  return rows[0] ? withAnalytics(rows[0]) : null;
}

function withAnalytics(campaign) {
  const days = campaign.end_date ? Math.max(0, Math.ceil((new Date(campaign.end_date) - new Date()) / 86400000)) : null;
  return { ...campaign, donor_count: Number(campaign.donor_count || 0), days_remaining: days };
}

module.exports = { getPublic, getAll, getByOrganization, getById, create, setVerification, addToAmountRaised };
