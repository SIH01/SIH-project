const pool = require("../db/pool");
const { expireActive } = require("../models/disasterModel");

const BOUNDING_BOX = { minLat: 22, maxLat: 29, minLon: 88, maxLon: 97 };
const MIN_MAGNITUDE = 5;
const ACTIVE_WINDOW_HOURS = Number(process.env.ACTIVE_ALERT_WINDOW_HOURS || 72);

function severityFromMagnitude(magnitude) {
  if (magnitude >= 7) return "Severe";
  if (magnitude >= 6) return "High";
  if (magnitude >= 5.5) return "Moderate";
  return "Low";
}

async function pollUsgs() {
  const start = new Date(Date.now() - ACTIVE_WINDOW_HOURS * 3600000).toISOString();
  const params = new URLSearchParams({ format: "geojson", starttime: start, minmagnitude: String(MIN_MAGNITUDE), minlatitude: String(BOUNDING_BOX.minLat), maxlatitude: String(BOUNDING_BOX.maxLat), minlongitude: String(BOUNDING_BOX.minLon), maxlongitude: String(BOUNDING_BOX.maxLon) });
  const response = await fetch(`https://earthquake.usgs.gov/fdsnws/event/1/query?${params}`);
  if (!response.ok) throw new Error(`USGS request failed: ${response.status}`);
  const data = await response.json();
  let inserted = 0;
  for (const feature of data.features || []) {
    const { mag, place, time, title, url } = feature.properties;
    const [longitude, latitude] = feature.geometry.coordinates;
    const name = title || `M${mag} Earthquake - ${place}`;
    const eventDate = new Date(time).toISOString().slice(0, 10);
    const existing = await pool.query("select id from disasters where name = $1 and event_date = $2", [name, eventDate]);
    if (existing.rows.length) continue;
    await pool.query(
      `insert into disasters (name, type, status, event_date, latitude, longitude, location_name, severity, description, safety_information, source, active_until)
       values ($1, 'Earthquake', 'Current', $2, $3, $4, $5, $6, $7, $8, $9, now() + ($10 * interval '1 hour'))`,
      [name, eventDate, latitude, longitude, place || "Northeast India", severityFromMagnitude(mag), `Magnitude ${mag} earthquake reported near ${place || "Northeast India"}.`, "Follow official emergency guidance and move to a safe open area after shaking stops.", `USGS Earthquake Catalog: ${url}`, ACTIVE_WINDOW_HOURS]
    );
    inserted++;
  }
  return inserted;
}

async function runActiveAlertJob() {
  const expired = await expireActive();
  let inserted = 0;
  try { inserted = await pollUsgs(); }
  catch (error) { console.error("USGS active alert poll failed:", error.message); }
  if (expired || inserted) console.log(`Active alert job: ${inserted} added, ${expired} expired.`);
}

module.exports = { runActiveAlertJob };
