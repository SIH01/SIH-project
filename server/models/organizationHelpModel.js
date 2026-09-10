const pool = require("../db/pool");
const { haversineDistanceKm } = require("../utils/haversine");

const SELECT = `h.id, h.request_id, h.type, h.name, h.phone, h.email, h.location_text,
  h.latitude, h.longitude, h.description, h.urgency, h.status, h.claimed_by_org_id,
  h.assigned_organization_id, h.internal_notes, h.attachments, h.created_at, h.updated_at,
  assigned.name as assigned_organization_name, claimed.name as claimed_organization_name`;

function normalize(value) {
  return String(value || "").toLowerCase().replace(/[_-]/g, " ").trim();
}
function categoryMatches(type, categories) {
  const requestType = normalize(type);
  return categories.some((category) => {
    const service = normalize(category);
    return service === requestType || service.includes(requestType) || requestType.includes(service);
  });
}
function regionMatches(request, organization) {
  if (request.latitude == null || request.longitude == null || organization.latitude == null || organization.longitude == null) return true;
  return haversineDistanceKm(organization.latitude, organization.longitude, request.latitude, request.longitude) <= 50;
}

async function loadRequests(organization, filters = {}) {
  const values = [];
  const where = ["h.status not in ('resolved', 'closed')"];
  if (filters.status) { values.push(filters.status); where.push(`h.status = $${values.length}`); }
  if (filters.urgency) { values.push(filters.urgency); where.push(`h.urgency = $${values.length}`); }
  if (filters.type) { values.push(filters.type); where.push(`h.type = $${values.length}`); }
  if (filters.search) { values.push(`%${filters.search}%`); where.push(`(h.name ilike $${values.length} or h.description ilike $${values.length} or h.location_text ilike $${values.length})`); }
  const { rows } = await pool.query(`select ${SELECT} from help_requests h left join organizations assigned on assigned.id = h.assigned_organization_id left join organizations claimed on claimed.id = h.claimed_by_org_id where ${where.join(" and ")} order by case h.urgency when 'critical' then 1 when 'medium' then 2 when 'low' then 3 else 4 end, h.created_at desc`, values);
  const categories = organization.assistance_categories || [];
  return rows.filter((request) => {
    const assigned = request.assigned_organization_id === organization.id;
    const matching = categoryMatches(request.type, categories) && regionMatches(request, organization);
    const visible = assigned || matching;
    const claimedFilter = filters.claimed;
    const claimed = request.claimed_by_org_id != null;
    return visible && (!claimedFilter || (claimedFilter === "true" ? claimed : !claimed));
  }).map((request) => ({ ...request, routing_reason: request.assigned_organization_id === organization.id ? "Assigned by admin" : `Auto-matched - you offer ${request.type}`, actionable: !request.claimed_by_org_id || request.claimed_by_org_id === organization.id }));
}

async function getById(id, organization) {
  const { rows } = await pool.query(`select ${SELECT} from help_requests h left join organizations assigned on assigned.id = h.assigned_organization_id left join organizations claimed on claimed.id = h.claimed_by_org_id where h.id = $1`, [id]);
  const request = rows[0];
  if (!request) return null;
  const visible = request.assigned_organization_id === organization.id || (categoryMatches(request.type, organization.assistance_categories || []) && regionMatches(request, organization));
  if (!visible) return null;
  const messages = await pool.query(`select id, sender_role, sender_user_id, body, attachment_url, created_at from organization_help_messages where help_request_id = $1 and organization_id = $2 order by created_at`, [id, organization.id]);
  return { ...request, routing_reason: request.assigned_organization_id === organization.id ? "Assigned by admin" : `Auto-matched - you offer ${request.type}`, actionable: !request.claimed_by_org_id || request.claimed_by_org_id === organization.id, messages: [{ id: `request-${request.id}`, sender_role: "citizen", body: request.description, created_at: request.created_at }, ...messages.rows] };
}

async function stats(organization) {
  const requests = await loadRequests(organization);
  return { total: requests.length, pending: requests.filter((item) => item.status === "new" || item.status === "in_review").length, in_progress: requests.filter((item) => item.status === "in_progress").length, resolved: requests.filter((item) => item.status === "resolved").length, average_response_minutes: null };
}

async function claim(id, organizationId) {
  const { rows } = await pool.query(`update help_requests set claimed_by_org_id = $1, status = 'in_progress', updated_at = now() where id = $2 and (claimed_by_org_id is null or claimed_by_org_id = $1) returning id`, [organizationId, id]);
  return rows[0] || null;
}
async function updateStatus(id, organizationId, status, internalNotes) {
  const { rows } = await pool.query(`update help_requests set status = $1, internal_notes = coalesce($2, internal_notes), updated_at = now() where id = $3 and (assigned_organization_id = $4 or claimed_by_org_id = $4 or (claimed_by_org_id is null and exists (select 1 from organizations o where o.id = $4))) returning id`, [status, internalNotes ?? null, id, organizationId]);
  return rows[0] ? getById(id, await organizationById(organizationId)) : null;
}
async function addMessage(id, organizationId, senderUserId, body, attachmentUrl) {
  const organization = await organizationById(organizationId);
  const request = await getById(id, organization);
  if (!request || !request.actionable) return null;
  await pool.query(`insert into organization_help_messages (help_request_id, organization_id, sender_role, sender_user_id, body, attachment_url) values ($1,$2,'organization',$3,$4,$5)`, [id, organizationId, senderUserId, body, attachmentUrl || null]);
  await pool.query(`update help_requests set status = case when status = 'new' then 'in_review' else status end, updated_at = now() where id = $1`, [id]);
  return getById(id, organization);
}
async function assign(id, organizationId) {
  const { rows } = await pool.query(`update help_requests set assigned_organization_id = $1, updated_at = now() where id = $2 returning id`, [organizationId, id]);
  return rows[0] || null;
}
async function organizationById(id) { const { rows } = await pool.query("select * from organizations where id = $1", [id]); return rows[0] || null; }
module.exports = { loadRequests, getById, stats, claim, updateStatus, addMessage, assign, organizationById };
