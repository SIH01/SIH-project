import React, { useState } from "react";
import { api } from "../services/api";
import { REQUEST_TYPES } from "../utils/assistanceOptions";

const fieldStyle = {
  width: "100%",
  padding: "0.6rem 0.8rem",
  border: "1px solid var(--line)",
  borderRadius: "4px",
  fontSize: "0.95rem",
  fontFamily: "var(--font-body)",
};
const labelStyle = { display: "block", fontWeight: 600, marginBottom: "0.35rem", fontSize: "0.9rem" };
const fieldWrapStyle = { marginBottom: "1.1rem" };

const EMPTY_FORM = {
  request_type: "Food",
  requester_name: "",
  contact_phone: "",
  contact_email: "",
  location_name: "",
  description: "",
};

export default function GetHelp() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submittedId, setSubmittedId] = useState(null);

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function useMyLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 }
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { data } = await api.post("/assistance", {
        ...form,
        latitude: coords?.lat ?? null,
        longitude: coords?.lng ?? null,
      });
      setSubmittedId(data.request.id);
      setForm(EMPTY_FORM);
      setCoords(null);
    } catch (err) {
      setError(err.response?.data?.error || "Could not submit your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submittedId) {
    return (
      <div style={{ maxWidth: "560px", margin: "4rem auto", padding: "0 2rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>Request received</h1>
        <p style={{ color: "#5c6673", marginBottom: "1.5rem" }}>
          Your request (#{submittedId}) has been logged and will be reviewed by our team.
          {form.contact_phone || form.contact_email
            ? " We'll reach out using the contact details you provided."
            : ""}
        </p>
        <button className="btn btn-awareness" onClick={() => setSubmittedId(null)}>
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "560px", margin: "3rem auto", padding: "0 2rem" }}>
      <h1 style={{ fontSize: "1.8rem", marginBottom: "0.4rem" }}>Get Help</h1>
      <p style={{ color: "#5c6673", marginBottom: "1.75rem" }}>
        Request food, shelter, medical, mental-health, missing-person, or financial assistance.
        No account required — an admin will review and follow up.
      </p>

      {error && <div className="error-banner" style={{ marginBottom: "1.25rem" }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={fieldWrapStyle}>
          <label style={labelStyle}>Type of help needed</label>
          <select style={fieldStyle} value={form.request_type} onChange={(e) => set("request_type", e.target.value)}>
            {REQUEST_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div style={fieldWrapStyle}>
          <label style={labelStyle}>Your name</label>
          <input style={fieldStyle} value={form.requester_name} onChange={(e) => set("requester_name", e.target.value)} required />
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <div style={{ ...fieldWrapStyle, flex: 1 }}>
            <label style={labelStyle}>Phone (optional)</label>
            <input style={fieldStyle} value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} />
          </div>
          <div style={{ ...fieldWrapStyle, flex: 1 }}>
            <label style={labelStyle}>Email (optional)</label>
            <input style={fieldStyle} type="email" value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} />
          </div>
        </div>
        <p style={{ fontSize: "0.8rem", color: "#5c6673", marginTop: "-0.7rem", marginBottom: "1.1rem" }}>
          At least one of phone or email is required so we can follow up.
        </p>

        <div style={fieldWrapStyle}>
          <label style={labelStyle}>Location</label>
          <input
            style={fieldStyle}
            placeholder="e.g. Ward 4, Silchar, Assam"
            value={form.location_name}
            onChange={(e) => set("location_name", e.target.value)}
            required
          />
          <button
            type="button"
            className="btn btn-outline-ink"
            onClick={useMyLocation}
            style={{ marginTop: "0.5rem", padding: "0.35rem 0.8rem", fontSize: "0.85rem" }}
            disabled={locating}
          >
            {locating ? "Locating…" : coords ? "📍 Location attached" : "📍 Attach my current location"}
          </button>
        </div>

        <div style={fieldWrapStyle}>
          <label style={labelStyle}>Describe what you need</label>
          <textarea
            style={{ ...fieldStyle, minHeight: "110px", resize: "vertical" }}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            required
          />
        </div>

        <button className="btn btn-awareness" type="submit" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit request"}
        </button>
      </form>
    </div>
  );
}
