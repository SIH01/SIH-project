const pool = require("../db/pool");

const SELECT_FIELDS = `
  id, organization_id, assistance_request_id, response, status, created_at, updated_at
`;

async function create({ organizationId, assistanceRequestId, response, status }) {
  const { rows } = await pool.query(
    `insert into organization_responses (organization_id, assistance_request_id, response, status)
     values ($1, $2, $3, $4) returning ${SELECT_FIELDS}`,
    [organizationId, assistanceRequestId, response || null, status || "New"]
  );
  return rows[0];
}

async function getForOrganization(organizationId) {
  const { rows } = await pool.query(
    `select ${SELECT_FIELDS} from organization_responses where organization_id = $1 order by created_at desc`,
    [organizationId]
  );
  return rows;
}

async function updateStatus(id, organizationId, { response, status }) {
  const { rows } = await pool.query(
    `update organization_responses set
       response = coalesce($1, response),
       status = coalesce($2, status),
       updated_at = now()
     where id = $3 and organization_id = $4
     returning ${SELECT_FIELDS}`,
    [response || null, status || null, id, organizationId]
  );
  return rows[0] || null;
}

module.exports = { create, getForOrganization, updateStatus };
