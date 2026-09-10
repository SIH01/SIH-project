require("dotenv").config();
const pool = require("../db/pool");

// Bounding box roughly covering Assam & Northeast India — adjust if you
// want a wider or narrower area.
const BOUNDING_BOX = { minLat: 6, maxLat: 37.5, minLon: 68, maxLon: 97.5 };
const MIN_MAGNITUDE = process.env.MIN_MAGNITUDE ? parseFloat(process.env.MIN_MAGNITUDE) : 4.5;
const START_DATE = "1900-01-01";
const END_DATE = new Date().toISOString().slice(0, 10);

function severityFromMagnitude(mag) {
  if (mag >= 7) return "Severe";
  if (mag >= 6) return "High";
  if (mag >= 5.5) return "Moderate";
  return "Low";
}

async function fetchUsgsEarthquakes() {
  const url =
    `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson` +
    `&starttime=${START_DATE}&endtime=${END_DATE}` +
    `&minmagnitude=${MIN_MAGNITUDE}` +
    `&minlatitude=${BOUNDING_BOX.minLat}&maxlatitude=${BOUNDING_BOX.maxLat}` +
    `&minlongitude=${BOUNDING_BOX.minLon}&maxlongitude=${BOUNDING_BOX.maxLon}`;

  console.log("Fetching from USGS:", url);
  const res = await fetch(url); // Node 18+ has fetch built in
  if (!res.ok) throw new Error(`USGS request failed: ${res.status}`);
  const data = await res.json();
  return data.features;
}

async function alreadyImported(name, eventDate) {
  const { rows } = await pool.query(
    "select id from disasters where name = $1 and event_date = $2",
    [name, eventDate]
  );
  return rows.length > 0;
}

async function run() {
  const features = await fetchUsgsEarthquakes();
  console.log(`Found ${features.length} earthquakes from USGS.`);

  let imported = 0;
  let skipped = 0;

  for (const feature of features) {
    const { mag, place, time, title, url } = feature.properties;
    const [lon, lat] = feature.geometry.coordinates;
    const eventDate = new Date(time).toISOString().slice(0, 10);
    const name = title || `M${mag} Earthquake — ${place}`;

    if (await alreadyImported(name, eventDate)) {
      skipped++;
      continue;
    }

    await pool.query(
      `insert into disasters
        (name, type, status, event_date, latitude, longitude, location_name,
         severity, affected_area, description, safety_information, source)
       values ($1,'Earthquake','Historical',$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        name,
        eventDate,
        lat,
        lon,
        place || "Northeast India",
        severityFromMagnitude(mag),
        place || null,
        `Magnitude ${mag} earthquake recorded near ${place}. Imported from the USGS Earthquake Catalog.`,
        "Drop, cover, and hold on during earthquakes; move to open ground afterward and watch for aftershocks.",
        `IMPORTED — USGS Earthquake Catalog: ${url}`,
      ]
    );
    imported++;
  }

  console.log(`Done. Imported ${imported} new records, skipped ${skipped} already-imported duplicates.`);
  await pool.end();
}

run().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});