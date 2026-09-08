import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Circle, CircleMarker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { api } from "../services/api";
import { colorForType, radiusForSeverity } from "../utils/disasterOptions";
import { applyDisasterFilters, DEFAULT_FILTERS } from "../utils/filterDisasters";
import DisasterFilters from "../components/DisasterFilters";
import RiskSummary from "../components/RiskSummary";

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
      onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function shortenLabel(displayName) {
  return displayName ? displayName.split(",").slice(0, 3).join(",") : null;
}

export default function DisasterMap() {
  const [selected, setSelected] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchError, setSearchError] = useState("");
  const [searching, setSearching] = useState(false);

  const [disasters, setDisasters] = useState([]);
  const [loadingDisasters, setLoadingDisasters] = useState(false);
  const [disasterError, setDisasterError] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // Fetch nearby disasters whenever the selected point changes.
  useEffect(() => {
    if (!selected) {
      setDisasters([]);
      return;
    }
    let cancelled = false;
    setLoadingDisasters(true);
    setDisasterError("");
    api
      .get("/disasters/nearby", { params: { lat: selected.lat, lng: selected.lng, radius: RADIUS_KM } })
      .then(({ data }) => {
        if (!cancelled) setDisasters(data.disasters);
      })
      .catch(() => {
        if (!cancelled) setDisasterError("Could not load disaster records for this area.");
      })
      .finally(() => {
        if (!cancelled) setLoadingDisasters(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selected?.lat, selected?.lng]);

  // Fill in a readable location name if we only have raw coordinates (map click).
  useEffect(() => {
    if (!selected || selected.label) return;
    let cancelled = false;
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${selected.lat}&lon=${selected.lng}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const label = shortenLabel(data.display_name);
        if (label) {
          setSelected((prev) =>
            prev && prev.lat === selected.lat && prev.lng === selected.lng ? { ...prev, label } : prev
          );
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [selected]);

  async function handleSearch(e) {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setSearching(true);
    setSearchError("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(searchTerm)}`
      );
      const results = await res.json();
      if (results.length === 0) {
        setSearchError("No matching location found.");
        return;
      }
      setSelected({
        lat: parseFloat(results[0].lat),
        lng: parseFloat(results[0].lon),
        label: shortenLabel(results[0].display_name),
      });
    } catch (err) {
      setSearchError("Search failed. Check your connection and try again.");
    } finally {
      setSearching(false);
    }
  }

  const filteredDisasters = applyDisasterFilters(disasters, filters);

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
            style={{ flex: 1, padding: "0.6rem 0.9rem", border: "1px solid var(--line)", borderRadius: "4px", fontSize: "0.95rem" }}
          />
          <button className="btn btn-outline-ink" type="submit" disabled={searching}>
            {searching ? "Searching…" : "Search"}
          </button>
        </form>
      </div>

      {selected && (
        <div style={{ margin: "1rem 2rem 0", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ padding: "1rem 1.25rem", background: "#fff", border: "1px solid var(--line)", borderRadius: "6px", flex: 1, minWidth: "260px" }}>
            <div style={{ fontWeight: 700, marginBottom: "0.4rem" }}>Selected Location</div>
            {selected.label && <div style={{ marginBottom: "0.4rem" }}>{selected.label}</div>}
            <div>Latitude: {selected.lat.toFixed(4)}</div>
            <div>Longitude: {selected.lng.toFixed(4)}</div>
            <div style={{ marginTop: "0.4rem", color: "var(--awareness-dark)", fontWeight: 600 }}>
              Search Radius: {RADIUS_KM} km
            </div>
          </div>

          {!loadingDisasters && disasters.length > 0 && (
            <RiskSummary locationName={selected.label || `${selected.lat.toFixed(2)}, ${selected.lng.toFixed(2)}`} radiusKm={RADIUS_KM} disasters={disasters} />
          )}
        </div>
      )}

      {disasterError && <div className="error-banner" style={{ margin: "1rem 2rem" }}>{disasterError}</div>}

      {selected && (
        <div style={{ margin: "1rem 2rem 0" }}>
          <DisasterFilters filters={filters} onChange={setFilters} />
        </div>
      )}

      <div style={{ display: "flex", gap: "1rem", margin: "1rem 2rem 0", flexWrap: "wrap" }}>
        <div style={{ flex: 2, minWidth: "320px", height: "65vh" }}>
          <MapContainer center={[20.5937, 78.9629]} zoom={4} style={{ height: "100%", width: "100%", borderRadius: "6px" }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ClickHandler onSelect={setSelected} />
            {selected && (
              <>
                <Marker position={selected} icon={markerIcon} />
                <Circle center={selected} radius={RADIUS_METERS} pathOptions={{ color: "#2f6f76", fillOpacity: 0.08 }} />
              </>
            )}
            {filteredDisasters.map((d) => (
              <CircleMarker
                key={d.id}
                center={[d.latitude, d.longitude]}
                radius={radiusForSeverity(d.severity)}
                pathOptions={{ color: colorForType(d.type), fillColor: colorForType(d.type), fillOpacity: 0.75, weight: 2 }}
              >
                <Popup>
                  <div style={{ minWidth: "180px" }}>
                    <div style={{ fontWeight: 700, marginBottom: "0.25rem" }}>{d.name}</div>
                    <div>{d.type} · {d.status}</div>
                    <div>{new Date(d.date).toLocaleDateString()}</div>
                    <div>Severity: {d.severity}</div>
                    <div style={{ color: "var(--awareness-dark)", fontWeight: 600, marginBottom: "0.4rem" }}>
                      {d.distance_km} km away
                    </div>
                    <Link to={`/disasters/${d.id}?lat=${selected.lat}&lng=${selected.lng}`}>View full details →</Link>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        {selected && (
          <div style={{ flex: 1, minWidth: "260px", height: "65vh", overflowY: "auto", background: "#fff", border: "1px solid var(--line)", borderRadius: "6px" }}>
            {loadingDisasters ? (
              <p style={{ padding: "1rem" }}>Loading disaster records…</p>
            ) : filteredDisasters.length === 0 ? (
              <p style={{ padding: "1rem", color: "#5c6673" }}>No disasters match the current filters.</p>
            ) : (
              filteredDisasters.map((d) => (
                <Link
                  key={d.id}
                  to={`/disasters/${d.id}?lat=${selected.lat}&lng=${selected.lng}`}
                  style={{ display: "block", padding: "0.9rem 1rem", borderBottom: "1px solid var(--line)", textDecoration: "none", color: "inherit" }}
                >
                  <div style={{ fontWeight: 700 }}>{d.name}</div>
                  <div style={{ fontSize: "0.85rem", color: "#5c6673" }}>
                    {d.type} · {d.severity} · {d.distance_km} km away
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>

      <p style={{ padding: "1rem 2rem", color: "#5c6673", fontSize: "0.9rem" }}>
        Click anywhere on the map to drop a pin, or search above. Disaster markers within {RADIUS_KM} km
        of your selected point appear automatically — filter, sort, or click any record for full details.
      </p>
    </div>
  );
}