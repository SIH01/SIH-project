const pool = require("../db/pool");

const SELECT_FIELDS = `
  s.id, s.name, s.latitude, s.longitude, s.capacity, s.current_occupancy,
  s.contact, s.facilities, s.added_by, s.approval_status, s.operational_status,
  s.reviewed_by, s.review_note, s.created_at, s.updated_at, o.name as organization_name
`;

async function create(data) {
  const { rows } = await pool.query(
    `insert into shelters (name, latitude, longitude, capacity, current_occupancy, contact, facilities, added_by)
     values ($1,$2,$3,$4,$5,$6,$7,$8) returning *`,
    [data.name, data.latitude, data.longitude, data.capacity, data.currentOccupancy || 0,
      data.contact || null, data.facilities || [], data.addedBy]
  );
  return rows[0];
}

async function nearby({ lat, lng, radiusKm }) {
  const { rows } = await pool.query(
    `select * from (
      select ${SELECT_FIELDS},
        (6371 * acos(least(1, cos(radians($1)) * cos(radians(s.latitude)) *
         cos(radians(s.longitude) - radians($2)) + sin(radians($1)) * sin(radians(s.latitude))))) as distance_km
      from shelters s join organizations o on o.id = s.added_by
      where s.approval_status = 'approved' and s.operational_status = 'active'
    ) nearby where distance_km <= $3 order by distance_km`, [lat, lng, radiusKm]
  );
  return rows;
}

async function listByOrg(orgId) {
  const { rows } = await pool.query(`select ${SELECT_FIELDS} from shelters s join organizations o on o.id = s.added_by where s.added_by = $1 order by s.created_at desc`, [orgId]);
  return rows;
}

async function listPending() {
  const { rows } = await pool.query(`select ${SELECT_FIELDS} from shelters s join organizations o on o.id = s.added_by where s.approval_status = 'pending' order by s.created_at desc`);
  return rows;
}

async function listAll() {
  const { rows } = await pool.query(`select ${SELECT_FIELDS} from shelters s join organizations o on o.id = s.added_by order by s.created_at desc`);
  return rows;
}

async function updateOwn(id, orgId, data) {
  const { rows } = await pool.query(
    `update shelters set name=$1, latitude=$2, longitude=$3, capacity=$4, current_occupancy=$5,
      contact=$6, facilities=$7, approval_status='pending', updated_at=now()
     where id=$8 and added_by=$9 returning *`,
    [data.name, data.latitude, data.longitude, data.capacity, data.currentOccupancy || 0,
      data.contact || null, data.facilities || [], id, orgId]
  );
  return rows[0] || null;
}

async function review(id, adminId, status, note) {
  const { rows } = await pool.query(
    `update shelters set approval_status=$1, reviewed_by=$2, review_note=$3, updated_at=now()
     where id=$4 returning *`, [status, adminId, note || null, id]
  );
  return rows[0] || null;
}

module.exports = { create, nearby, listByOrg, listPending, listAll, updateOwn, review };