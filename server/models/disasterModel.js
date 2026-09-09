const pool = require("../db/pool");
const { haversineDistanceKm } = require("../utils/haversine");

const SELECT_FIELDS = `
  id, name, type, status, event_date as date, latitude, longitude,
  location_name, severity, affected_area, description,
  safety_information, source, created_by, created_at, updated_at,
  active_until, last_confirmed_by, last_confirmed_at
`;

async function getAll(status) {
  const values = [];
  let where = "";
  if (status === "active") where = "where d.status = 'Current'";
  else if (status) {
    const normalized = status === "historical" ? "Historical" : status === "resolved" ? "Resolved" : status;
    values.push(normalized);
    where = `where d.status = $${values.length}`;
  }
  const order = status === "active" ? "coalesce(d.last_confirmed_at, d.created_at) desc" : "d.event_date desc";
  const { rows } = await pool.query(`select ${SELECT_FIELDS} from disasters d ${where} order by ${order}`, values);
  if (status === "active" && rows.length) {
    const { rows: confirmers } = await pool.query(
      `select d.id, u.name from disasters d left join users u on u.id = d.last_confirmed_by where d.id = any($1::int[])`,
      [rows.map((row) => row.id)]
    );
    const names = new Map(confirmers.map((row) => [row.id, row.name]));
    rows.forEach((row) => { row.last_confirmed_name = names.get(row.id) || null; });
  }
  return rows;
}

async function getActiveCount() {
  const { rows } = await pool.query("select count(*)::int as count from disasters where status = 'Current' and (active_until is null or active_until > now())");
  return rows[0].count;
}

async function getById(id) {
  const { rows } = await pool.query(`select ${SELECT_FIELDS} from disasters where id = $1`, [id]);
  return rows[0] || null;
}

// Prototype-scale approach: pull all records and filter in JS with the
// Haversine formula. Fine for a hackathon-sized disaster table; if this
// ever needs to scale to millions of rows, move the distance math into
// Postgres (e.g. the earthdistance/cube extension) instead.
async function getNearby({ lat, lng, radiusKm = 50 }) {
  const { rows } = await pool.query(`select ${SELECT_FIELDS} from disasters`);
  return rows
    .map((d) => ({
      ...d,
      distance_km: Math.round(haversineDistanceKm(lat, lng, d.latitude, d.longitude) * 10) / 10,
    }))
    .filter((d) => d.distance_km <= radiusKm)
    .sort((a, b) => a.distance_km - b.distance_km);
}

async function create(data) {
  const {
    name, type, status, date, latitude, longitude, location_name,
    severity, affected_area, description, safety_information, source, createdBy, activeUntil,
  } = data;
  const { rows } = await pool.query(
    `insert into disasters
      (name, type, status, event_date, latitude, longitude, location_name,
       severity, affected_area, description, safety_information, source, created_by, active_until)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     returning ${SELECT_FIELDS}`,
    [name, type, status, date, latitude, longitude, location_name,
     severity, affected_area, description, safety_information, source, createdBy, activeUntil || null]
  );
  return rows[0];
}

async function update(id, data) {
  const {
    name, type, status, date, latitude, longitude, location_name,
    severity, affected_area, description, safety_information, source, activeUntil,
  } = data;
  const { rows } = await pool.query(
    `update disasters set
       name=$1, type=$2, status=$3, event_date=$4, latitude=$5, longitude=$6,
       location_name=$7, severity=$8, affected_area=$9, description=$10,
       safety_information=$11, source=$12, active_until=$13, updated_at=now()
     where id=$14
     returning ${SELECT_FIELDS}`,
    [name, type, status, date, latitude, longitude, location_name,
     severity, affected_area, description, safety_information, source, activeUntil || null, id]
  );
  return rows[0] || null;
}

async function updateStatus(id, status, activeUntil, adminId) {
  const { rows } = await pool.query(
    `update disasters set status=$1, active_until=$2, last_confirmed_by=$3,
      last_confirmed_at=case when $1 = 'Current' then now() else last_confirmed_at end,
      updated_at=now() where id=$4 returning ${SELECT_FIELDS}`,
    [status, activeUntil || null, adminId, id]
  );
  return rows[0] || null;
}

async function extendActive(id, activeUntil, adminId) {
  const { rows } = await pool.query(
    `update disasters set status='Current', active_until=$1, last_confirmed_by=$2,
      last_confirmed_at=now(), updated_at=now() where id=$3 returning ${SELECT_FIELDS}`,
    [activeUntil, adminId, id]
  );
  return rows[0] || null;
}

async function expireActive() {
  const { rowCount } = await pool.query(
    `update disasters set status='Historical', updated_at=now()
     where status='Current' and active_until is not null and active_until <= now()`
  );
  return rowCount;
}

async function remove(id) {
  const { rowCount } = await pool.query("delete from disasters where id=$1", [id]);
  return rowCount > 0;
}

module.exports = { getAll, getActiveCount, getById, getNearby, create, update, updateStatus, extendActive, expireActive, remove };