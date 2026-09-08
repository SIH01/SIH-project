import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Leaflet's default marker icon path breaks under Vite's bundler unless we
// point it at the CDN copies directly.
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const RADIUS_KM = 50;
const RADIUS_METERS = RADIUS_KM * 1000;

function ClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng);
    },
  });
  return null;
}

export default function DisasterMap() {
  const [selected, setSelected] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchError, setSearchError] = useState("");
  const [searching, setSearching] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setSearching(true);
    setSearchError("");
    try {
      // Nominatim is free and requires no API key, per the "no paid Mapbox
      // key" requirement in the brief.
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(searchTerm)}`
      );
      const results = await res.json();
      if (results.length === 0) {
        setSearchError("No matching location found.");
        return;
      }
      setSelected({ lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) });
    } catch (err) {
      setSearchError("Search failed. Check your connection and try again.");
    } finally {
      setSearching(false);
    }
  }

  return (
    <div>
      <div
        style={{
          padding: "1.25rem 2rem",
          borderBottom: "1px solid var(--line)",
          display: "flex",
          gap: "1rem",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.6rem", flex: 1, minWidth: "260px" }}>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search a city or place…"
            style={{
              flex: 1,
              padding: "0.6rem 0.9rem",
              border: "1px solid var(--line)",
              borderRadius: "4px",
              fontSize: "0.95rem",
            }}
          />
          <button className="btn btn-outline-ink" type="submit" disabled={searching}>
            {searching ? "Searching…" : "Search"}
          </button>
        </form>
      </div>

      {selected && (
        <div
          style={{
            margin: "1rem 2rem 0",
            padding: "1rem 1.25rem",
            background: "#fff",
            border: "1px solid var(--line)",
            borderRadius: "6px",
            maxWidth: "320px",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: "0.4rem" }}>Selected Location</div>
          <div>Latitude: {selected.lat.toFixed(4)}</div>
          <div>Longitude: {selected.lng.toFixed(4)}</div>
          <div style={{ marginTop: "0.4rem", color: "var(--awareness-dark)", fontWeight: 600 }}>
            Search Radius: {RADIUS_KM} km
          </div>
        </div>
      )}

      {searchError && <div className="error-banner" style={{ margin: "1rem 2rem" }}>{searchError}</div>}

      <div style={{ height: "65vh", width: "100%", marginTop: "1rem" }}>
        <MapContainer center={[20.5937, 78.9629]} zoom={4} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onSelect={setSelected} />
          {selected && (
            <>
              <Marker position={selected} icon={markerIcon} />
              <Circle
                center={selected}
                radius={RADIUS_METERS}
                pathOptions={{ color: "#2f6f76", fillOpacity: 0.08 }}
              />
            </>
          )}
        </MapContainer>
      </div>

      <p style={{ padding: "1rem 2rem", color: "#5c6673", fontSize: "0.9rem" }}>
        Click anywhere on the map to drop a pin, or search above. Disaster
        markers within this {RADIUS_KM} km circle will appear here starting
        in Stage 3.
      </p>
    </div>
  );
}
