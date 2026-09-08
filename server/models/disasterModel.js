const pool = require("../db/pool");
const { haversineDistanceKm } = require("../utils/haversine");

const SELECT_FIELDS = `
  id, name, type, status, event_date as date, latitude, longitude,
  location_name, severity, affected_area, description,
  safety_information, source, created_by, created_at, updated_at
`;

async function getAll() {
  const { rows } = await pool.query(`select ${SELECT_FIELDS} from disasters order by event_date desc`);
  return rows;
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
    severity, affected_area, description, safety_information, source, createdBy,
  } = data;
  const { rows } = await pool.query(
    `insert into disasters
      (name, type, status, event_date, latitude, longitude, location_name,
       severity, affected_area, description, safety_information, source, created_by)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     returning ${SELECT_FIELDS}`,
    [name, type, status, date, latitude, longitude, location_name,
     severity, affected_area, description, safety_information, source, createdBy]
  );
  return rows[0];
}

async function update(id, data) {
  const {
    name, type, status, date, latitude, longitude, location_name,
    severity, affected_area, description, safety_information, source,
  } = data;
  const { rows } = await pool.query(
    `update disasters set
       name=$1, type=$2, status=$3, event_date=$4, latitude=$5, longitude=$6,
       location_name=$7, severity=$8, affected_area=$9, description=$10,
       safety_information=$11, source=$12, updated_at=now()
     where id=$13
     returning ${SELECT_FIELDS}`,
    [name, type, status, date, latitude, longitude, location_name,
     severity, affected_area, description, safety_information, source, id]
  );
  return rows[0] || null;
}

async function remove(id) {
  const { rowCount } = await pool.query("delete from disasters where id=$1", [id]);
  return rowCount > 0;
}

module.exports = { getAll, getById, getNearby, create, update, remove };