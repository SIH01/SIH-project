import React, { useEffect, useState } from "react";
import { api } from "../services/api";

const TYPES = ["NGO", "Charity", "Volunteer Group", "Food Distribution", "Medical", "Shelter Provider", "Search and Rescue", "Mental Health", "Other"];
const CATEGORIES = ["Food", "Water", "Medical", "Shelter", "Missing-person assistance", "Financial assistance", "Mental-health support", "Search and rescue", "Essential supplies", "Other"];

export default function OrganizationProfileEditor() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/organizations/me")
      .then(({ data }) => setForm({ ...data.organization, assistance_categories: data.organization.assistance_categories || [] }))
      .catch((err) => setError(err.response?.data?.error || "Could not load organization profile."));
  }, []);

  function set(key, value) { setForm((current) => ({ ...current, [key]: value })); }
  function toggleCategory(category) {
    set("assistance_categories", form.assistance_categories.includes(category)
      ? form.assistance_categories.filter((item) => item !== category)
      : [...form.assistance_categories, category]);
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true); setMessage(""); setError("");
    try {
      const { data } = await api.patch("/organizations/me", form);
      setForm({ ...data.organization, assistance_categories: data.organization.assistance_categories || [] });
      setMessage("Organization profile updated.");
    } catch (err) {
      setError(err.response?.data?.error || "Could not update organization profile.");
    } finally { setSaving(false); }
  }

  if (!form) return error ? <div className="error-banner">{error}</div> : <p className="dashboard-muted">Loading organization profile…</p>;

  return (
    <form className="organization-profile-editor" onSubmit={save}>
      {error && <div className="error-banner">{error}</div>}
      {message && <div className="modal-message">{message}</div>}
      <div className="profile-editor-grid">
        <label className="field"><span>Organization name</span><input value={form.name || ""} onChange={(event) => set("name", event.target.value)} required /></label>
        <label className="field"><span>Organization type</span><select value={form.type || ""} onChange={(event) => set("type", event.target.value)}>{TYPES.map((type) => <option key={type}>{type}</option>)}</select></label>
        <label className="field profile-editor-wide"><span>Description</span><textarea rows="3" value={form.description || ""} onChange={(event) => set("description", event.target.value)} /></label>
        <label className="field"><span>Phone</span><input value={form.phone || ""} onChange={(event) => set("phone", event.target.value)} /></label>
        <label className="field"><span>Operating area</span><input value={form.operating_areas || ""} onChange={(event) => set("operating_areas", event.target.value)} placeholder="Districts or regions served" /></label>
        <label className="field"><span>Latitude</span><input type="number" step="any" value={form.latitude ?? ""} onChange={(event) => set("latitude", event.target.value)} /></label>
        <label className="field"><span>Longitude</span><input type="number" step="any" value={form.longitude ?? ""} onChange={(event) => set("longitude", event.target.value)} /></label>
      </div>
      <fieldset className="profile-services"><legend>Services offered</legend><div>{CATEGORIES.map((category) => <label key={category}><input type="checkbox" checked={form.assistance_categories.includes(category)} onChange={() => toggleCategory(category)} /> {category}</label>)}</div></fieldset>
      <div className="profile-editor-footer"><span className={`status-pill status-${String(form.verification_status || "").toLowerCase().replace(/\s+/g, "-")}`}>Verification: {form.verification_status}</span><button className="btn btn-relief" type="submit" disabled={saving}>{saving ? "Saving…" : "Save profile"}</button></div>
    </form>
  );
}
