require("dotenv").config();
const pool = require("../db/pool");

// Real, live data from NASA's Earth Observatory Natural Event Tracker
// (EONET) — a public, no-auth-required API tracking natural hazard events
// worldwide since 2015. https://eonet.gsfc.nasa.gov/docs/v3
//
// This is a companion to importUsgsEarthquakes.js: that script pulls real
// earthquakes; this one pulls real floods, storms/cyclones, landslides,
// wildfires, and droughts for the same India bounding box, from an actual
// government/NASA source — not fabricated data.
//
// Coverage note: EONET only reliably tracks "significant" events from
// ~2015 onward, and only ones that were newsworthy enough to be curated.
// For a single country this typically means dozens to a few hundred
// events total across all categories — NOT thousands. That's the real,
// honest number of freely available structured records; there is no
// public API with thousands of individually-verified disaster records
// for any one country's flood/storm/landslide history.

const BBOX = { minLon: 68, minLat: 6, maxLon: 97.5, maxLat: 37.5 }; // all of India
const CATEGORIES = ["floods", "severeStorms", "landslides", "wildfires", "drought"];
const EONET_BASE = "https://eonet.gsfc.nasa.gov/api/v3/events";

const CATEGORY_TO_TYPE = {
  floods: "Flood",
  landslides: "Landslide",
  wildfires: "Wildfire",
  drought: "Drought",
  // severeStorms is split further below based on the event title, since
  // EONET files both cyclones and generic storms under this one category.
};

function typeForEvent(categoryId, title) {
  if (categoryId === "severeStorms") {
    return /cyclone/i.test(title) ? "Cyclone" : "Storm";
  }
  return CATEGORY_TO_TYPE[categoryId] || "Other";
}

function severityFromCategory(categoryId) {
  // EONET doesn't provide a severity/magnitude for every category the way
  // USGS does for earthquakes, so this is a conservative default rather
  // than an invented precise score — every imported record is still
  // openly labeled with its real EONET source link for verification.
  if (categoryId === "severeStorms" || categoryId === "floods") return "Moderate";
  return "Low";
}

async function fetchEonetEvents(category) {
  const url =
    `${EONET_BASE}?status=all&limit=1000&category=${category}` +
    `&bbox=${BBOX.minLon},${BBOX.maxLat},${BBOX.maxLon},${BBOX.minLat}`;
  console.log(`Fetching ${category} from NASA EONET:`, url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`EONET request failed for ${category}: ${res.status}`);
  const data = await res.json();
  return data.events || [];
}

async function alreadyImported(name, eventDate) {
  const { rows } = await pool.query(
    "select id from disasters where name = $1 and event_date = $2",
    [name, eventDate]
  );
  return rows.length > 0;
}

async function run() {
  let imported = 0;
  let skipped = 0;
  let noGeometry = 0;

  for (const category of CATEGORIES) {
    const events = await fetchEonetEvents(category);
    console.log(`Found ${events.length} "${category}" events from EONET (before India-bbox filtering).`);

    for (const event of events) {
      // Some events carry a track (multiple geometry points over time, e.g.
      // a cyclone's path) — use the first point as the event's origin/
      // location, and its date as the event date.
      const geometry = event.geometry && event.geometry[0];
      if (!geometry || geometry.type !== "Point") { noGeometry++; continue; }
      const [lon, lat] = geometry.coordinates;
      if (lat < BBOX.minLat || lat > BBOX.maxLat || lon < BBOX.minLon || lon > BBOX.maxLon) continue;

      const eventDate = geometry.date.slice(0, 10);
      const name = event.title;
      const sourceUrl = (event.sources && event.sources[0] && event.sources[0].url) || event.link;
      const disasterType = typeForEvent(category, event.title);
      const status = event.closed ? "Historical" : "Current";
      // location_name is NOT NULL in the schema, but EONET rarely supplies
      // a clean place name — fall back to coordinates rather than crash
      // the insert or invent a place name that wasn't actually given.
      const locationName = event.description || `${lat.toFixed(2)}, ${lon.toFixed(2)} (India)`;

      if (await alreadyImported(name, eventDate)) { skipped++; continue; }

      await pool.query(
        `insert into disasters
          (name, type, status, event_date, latitude, longitude, location_name,
           severity, affected_area, description, safety_information, source)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          name, disasterType, status, eventDate, lat, lon, locationName,
          severityFromCategory(category), null,
          `${event.title}. Imported from NASA's EONET (Earth Observatory Natural Event Tracker).`,
          "Follow official advisories from India's National Disaster Management Authority (NDMA) or local authorities for this event type.",
          `IMPORTED — NASA EONET: ${sourceUrl}`,
        ]
      );
      imported++;
    }
  }

  console.log(`Done. Imported ${imported} new records, skipped ${skipped} duplicates, ${noGeometry} events had no usable point geometry.`);
  await pool.end();
}

run().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
