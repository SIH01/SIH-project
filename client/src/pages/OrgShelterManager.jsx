import React, { useEffect, useState } from "react";
import { api } from "../services/api";

const FACILITIES = ["Food", "Water", "Medical", "Power", "Accessibility", "Family space"];
const EMPTY = { name: "", latitude: "", longitude: "", capacity: "", currentOccupancy: "0", contact: "", facilities: [] };

export default function OrgShelterManager() {
  const [organization, setOrganization] = useState(null);
  const [shelters, setShelters] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      const { data } = await api.get("/organizations/me");
      setOrganization(data.organization);
      if (data.organization.verification_status === "Verified") {
        const shelterResponse = await api.get("/shelters/mine");
        setShelters(shelterResponse.data.shelters || []);
      }
    } catch (err) { setError(err.response?.data?.error || "Could not load organization profile."); }
  }
  useEffect(() => { load(); }, []);

  function set(key, value) { setForm((current) => ({ ...current, [key]: value })); }
  function toggleFacility(value) { set("facilities", form.facilities.includes(value) ? form.facilities.filter((item) => item !== value) : [...form.facilities, value]); }
  function edit(shelter) { setEditingId(shelter.id); setForm({ name: shelter.name, latitude: shelter.latitude, longitude: shelter.longitude, capacity: shelter.capacity, currentOccupancy: shelter.current_occupancy, contact: shelter.contact || "", facilities: shelter.facilities || [] }); }

  async function submit(event) {
    event.preventDefault(); setError(""); setMessage("");
    try {
      const response = editingId ? await api.patch(`/shelters/${editingId}`, form) : await api.post("/shelters", form);
      setShelters((current) => editingId ? current.map((item) => item.id === editingId ? response.data.shelter : item) : [response.data.shelter, ...current]);
      setMessage(editingId ? "Shelter updated and submitted for admin review." : "Submitted for admin review. It will appear on the public map once approved.");
      setEditingId(null); setForm(EMPTY);
    } catch (err) { setError(err.response?.data?.error || "Could not save shelter."); }
  }

  if (organization && organization.verification_status !== "Verified") return <div className="dashboard-shell"><div className="dashboard-card"><h1>Organization shelters</h1><p>Your organization is awaiting admin approval before you can add shelters.</p></div></div>;

  return (
    <div className="dashboard-shell">
      <div className="dashboard-card">
        <h1>Organization shelters</h1>
        <p className="dashboard-muted">Add and maintain shelters for the DisasterShield public map.</p>
        {error && <div className="error-banner">{error}</div>}{message && <div className="modal-message">{message}</div>}
        <form onSubmit={submit} className="shelter-form">
          <input required placeholder="Shelter name" value={form.name} onChange={(e) => set("name", e.target.value)} />
          <input required type="number" step="any" placeholder="Latitude" value={form.latitude} onChange={(e) => set("latitude", e.target.value)} />
          <input required type="number" step="any" placeholder="Longitude" value={form.longitude} onChange={(e) => set("longitude", e.target.value)} />
          <input required type="number" min="1" placeholder="Capacity" value={form.capacity} onChange={(e) => set("capacity", e.target.value)} />
          <input required type="number" min="0" placeholder="Current occupancy" value={form.currentOccupancy} onChange={(e) => set("currentOccupancy", e.target.value)} />
          <input placeholder="Contact" value={form.contact} onChange={(e) => set("contact", e.target.value)} />
          <div className="facility-picker"><strong>Facilities</strong>{FACILITIES.map((facility) => <label key={facility}><input type="checkbox" checked={form.facilities.includes(facility)} onChange={() => toggleFacility(facility)} /> {facility}</label>)}</div>
          <button className="btn btn-awareness" type="submit">{editingId ? "Update shelter" : "Add shelter"}</button>
          {editingId && <button className="btn btn-outline-ink" type="button" onClick={() => { setEditingId(null); setForm(EMPTY); }}>Cancel edit</button>}
        </form>
      </div>
      <div className="dashboard-card"><h2>My Shelters</h2>{shelters.length === 0 ? <p className="dashboard-muted">No shelters submitted yet.</p> : shelters.map((shelter) => <div className="admin-list-item" key={shelter.id}><div><strong>{shelter.name}</strong><div className="dashboard-muted">{shelter.current_occupancy}/{shelter.capacity} occupied · {shelter.facilities?.join(", ") || "No facilities listed"}</div>{shelter.approval_status === "rejected" && <small>{shelter.review_note || "No review note provided."}</small>}</div><div><span className={`status-pill status-${shelter.approval_status}`}>{shelter.approval_status === "pending" ? "Pending review" : shelter.approval_status}</span><button className="btn btn-outline-ink compact-button" onClick={() => edit(shelter)}>Edit</button></div></div>)}</div>
    </div>
  );
}
