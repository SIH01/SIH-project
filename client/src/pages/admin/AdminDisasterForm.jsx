import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { api } from "../../services/api";
import { DISASTER_TYPES, DISASTER_STATUSES, DISASTER_SEVERITIES } from "../../utils/disasterOptions";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const EMPTY_FORM = {
  name: "", type: "Flood", status: "Historical", severity: "Moderate",
  date: "", location_name: "", latitude: "", longitude: "",
  affected_area: "", description: "", safety_information: "", source: "",
};

const textareaStyle = {
  padding: "0.65rem 0.8rem",
  border: "1px solid var(--line)",
  borderRadius: "4px",
  fontFamily: "var(--font-body)",
  fontSize: "1rem",
};

function LocationPicker({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng);
    },
  });
  return null;
}

export default function AdminDisasterForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/disasters/${id}`)
      .then(({ data }) => {
        const d = data.disaster;
        setForm({
          name: d.name, type: d.type, status: d.status, severity: d.severity,
          date: d.date ? String(d.date).slice(0, 10) : "",
          location_name: d.location_name,
          latitude: d.latitude, longitude: d.longitude,
          affected_area: d.affected_area || "", description: d.description || "",
          safety_information: d.safety_information || "", source: d.source || "",
        });
      })
      .catch(() => setError("Could not load this disaster record."))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleMapSelect(latlng) {
    setForm((prev) => ({ ...prev, latitude: latlng.lat.toFixed(5), longitude: latlng.lng.toFixed(5) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = { ...form, latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude) };
    try {
      if (isEdit) {
        await api.put(`/disasters/${id}`, payload);
      } else {
        await api.post("/disasters", payload);
      }
      navigate("/admin/disasters");
    } catch (err) {
      setError(err.response?.data?.error || "Could not save this disaster record.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p style={{ padding: "2rem" }}>Loading…</p>;

  const mapCenter = form.latitude && form.longitude
    ? [parseFloat(form.latitude), parseFloat(form.longitude)]
    : [20.5937, 78.9629];

  return (
    <div style={{ maxWidth: "640px", margin: "3rem auto", padding: "0 2rem" }}>
      <h1 style={{ fontSize: "1.8rem", marginBottom: "1.5rem" }}>
        {isEdit ? "Edit Disaster" : "Add Disaster"}
      </h1>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Disaster Name</label>
          <input name="name" value={form.name} onChange={handleChange} required />
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Type</label>
            <select name="type" value={form.type} onChange={handleChange}>
              {DISASTER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Status</label>
            <select name="status" value={form.status} onChange={handleChange}>
              {DISASTER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Severity</label>
            <select name="severity" value={form.severity} onChange={handleChange}>
              {DISASTER_SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Date</label>
            <input type="date" name="date" value={form.date} onChange={handleChange} required />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Location Name</label>
            <input name="location_name" value={form.location_name} onChange={handleChange} placeholder="e.g. Guwahati, Assam" required />
          </div>
        </div>

        <div className="field">
          <label>Coordinates — click the map to set</label>
          <div style={{ height: "260px", border: "1px solid var(--line)", borderRadius: "4px", overflow: "hidden" }}>
            <MapContainer center={mapCenter} zoom={form.latitude ? 8 : 4} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationPicker onSelect={handleMapSelect} />
              {form.latitude && form.longitude && (
                <Marker position={[parseFloat(form.latitude), parseFloat(form.longitude)]} icon={markerIcon} />
              )}
            </MapContainer>
          </div>
          <div style={{ fontSize: "0.85rem", color: "#5c6673", marginTop: "0.4rem" }}>
            Latitude: {form.latitude || "—"} · Longitude: {form.longitude || "—"}
          </div>
        </div>

        <div className="field">
          <label>Affected Area</label>
          <input name="affected_area" value={form.affected_area} onChange={handleChange} placeholder="e.g. 12 districts" />
        </div>

        <div className="field">
          <label>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={4} style={textareaStyle} />
        </div>

        <div className="field">
          <label>Safety Information</label>
          <textarea name="safety_information" value={form.safety_information} onChange={handleChange} rows={3} style={textareaStyle} />
        </div>

        <div className="field">
          <label>Source</label>
          <input name="source" value={form.source} onChange={handleChange} placeholder="e.g. NDMA, IMD, demo data" required />
        </div>

        <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
          <button type="submit" className="btn btn-awareness" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Disaster"}
          </button>
          <Link to="/admin/disasters" className="btn btn-outline-ink">Cancel</Link>
        </div>
      </form>
    </div>
  );
}