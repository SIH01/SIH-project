const pool = require("../db/pool");

// New, read-mostly module for Sections 18-20 of the spec (org dashboard +
// 50km matching + org response). Deliberately does NOT modify
// helpRequestModel.js or reliefRequestModel.js — it queries the same two
// tables directly so those existing files and the admin screens built on
// top of them stay exactly as they were.

const HELP_SELECT = `
  h.id, 'help_request' as source, h.request_id, h.type as category, h.name,
  h.phone, h.email, h.location_text, h.latitude, h.longitude, h.description,
  h.urgency, h.status, h.claimed_by_org_id, h.created_at
`;
const RELIEF_SELECT = `
  rr.id, 'relief_request' as source, null as request_id, rr.need_type as category, rr.name,
  rr.contact as phone, null as email, d.location_name as location_text,
  rr.latitude, rr.longitude, rr.description,
  case rr.need_type when 'rescue' then 'critical' else 'medium' end as urgency,
  rr.status, rr.claimed_by_org_id, rr.created_at
`;

// Requests within radiusKm of (lat, lng) that are still open (not
// resolved/closed) and either unclaimed or already claimed by this org.
// Distance computed in SQL, same haversine-via-acos approach shelterModel
// already uses, so results are consistent with the shelters "nearby" view.
async function nearbyForOrg({ lat, lng, radiusKm, orgId }) {
  const { rows } = await pool.query(
    `select * from (
      select ${HELP_SELECT},
        (6371 * acos(least(1, cos(radians($1)) * cos(radians(h.latitude)) *
         cos(radians(h.longitude) - radians($2)) + sin(radians($1)) * sin(radians(h.latitude))))) as distance_km
      from help_requests h
      where h.latitude is not null and h.longitude is not null
        and h.status not in ('resolved', 'closed')
        and (h.claimed_by_org_id is null or h.claimed_by_org_id = $4)
      union all
      select ${RELIEF_SELECT},
        (6371 * acos(least(1, cos(radians($1)) * cos(radians(rr.latitude)) *
         cos(radians(rr.longitude) - radians($2)) + sin(radians($1)) * sin(radians(rr.latitude))))) as distance_km
      from relief_requests rr
      left join disasters d on d.id = rr.disaster_id
      where rr.latitude is not null and rr.longitude is not null
        and rr.status != 'resolved'
        and (rr.claimed_by_org_id is null or rr.claimed_by_org_id = $4)
    ) matches
    where distance_km <= $3
    order by distance_km`,
    [lat, lng, radiusKm, orgId]
  );
  return rows;
}

async function listClaimedByOrg(orgId) {
  const { rows } = await pool.query(
    `select ${HELP_SELECT}, null as distance_km from help_requests h where h.claimed_by_org_id = $1
     union all
     select ${RELIEF_SELECT}, null as distance_km from relief_requests rr
     left join disasters d on d.id = rr.disaster_id where rr.claimed_by_org_id = $1
     order by created_at desc`,
    [orgId]
  );
  return rows;
}

// Claim (or update the claimed status of) a single request. Ownership is
// enforced in the WHERE clause — an org can only touch rows it already
// claimed, or unclaimed rows when claiming for the first time.
// help_requests has an updated_at column; relief_requests (schema_stage11)
// does not — so this branches per table rather than sharing one query.
async function claimOrUpdate(source, id, orgId, status) {
  if (source === "help_request") {
    const { rows } = await pool.query(
      `update help_requests set
         claimed_by_org_id = $1, status = coalesce($2, status), updated_at = now()
       where id = $3 and (claimed_by_org_id is null or claimed_by_org_id = $1)
       returning id`,
      [orgId, status || null, id]
    );
    return rows[0] || null;
  }
  const { rows } = await pool.query(
    `update relief_requests set claimed_by_org_id = $1, status = coalesce($2, status)
     where id = $3 and (claimed_by_org_id is null or claimed_by_org_id = $1)
     returning id`,
    [orgId, status || null, id]
  );
  return rows[0] || null;
}

module.exports = { nearbyForOrg, listClaimedByOrg, claimOrUpdate };
