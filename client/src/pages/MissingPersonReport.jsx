import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

const EMPTY_FORM = {
  reporter_name: "", reporter_contact: "", person_name: "", age: "",
  last_known_location: "", date_last_seen: "", description: "", additional_information: "",
};

export default function MissingPersonReport() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState(null);

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { data } = await api.post("/missing-persons", {
        ...form,
        age: form.age ? parseInt(form.age, 10) : null,
      });
      setConfirmation(data.report);
    } catch (err) {
      setError(err.response?.data?.error || "Could not submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmation) {
    return (
      <main className="help-shell">
        <section className="help-card">
          <div className="confirmation-mark">✓</div>
          <h1>Report #{confirmation.id} received</h1>
          <p>
            Status: <strong>{confirmation.status}</strong>. This report is not publicly visible — an
            administrator will review it before any further action is taken.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
            <button className="btn btn-relief" onClick={() => { setConfirmation(null); setForm(EMPTY_FORM); }}>
              Submit another report
            </button>
            <Link className="btn btn-outline-ink" to="/">Return home</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="help-shell">
      <section className="help-card">
        <h1>Report a Missing Person</h1>
        <p className="help-intro">
          This report goes straight to review — it is never automatically made public. An administrator
          will review the details before taking any action.
        </p>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="help-field">
            <label htmlFor="mp-reporter-name">Your name</label>
            <input id="mp-reporter-name" value={form.reporter_name} onChange={(e) => set("reporter_name", e.target.value)} required />
          </div>
          <div className="help-field">
            <label htmlFor="mp-reporter-contact">Your contact (phone or email)</label>
            <input id="mp-reporter-contact" value={form.reporter_contact} onChange={(e) => set("reporter_contact", e.target.value)} required />
          </div>
          <div className="help-field">
            <label htmlFor="mp-person-name">Missing person's name</label>
            <input id="mp-person-name" value={form.person_name} onChange={(e) => set("person_name", e.target.value)} required />
          </div>
          <div className="help-field">
            <label htmlFor="mp-age">Age (if known)</label>
            <input id="mp-age" type="number" min="0" max="149" value={form.age} onChange={(e) => set("age", e.target.value)} />
          </div>
          <div className="help-field">
            <label htmlFor="mp-location">Last known location</label>
            <input id="mp-location" value={form.last_known_location} onChange={(e) => set("last_known_location", e.target.value)} required />
          </div>
          <div className="help-field">
            <label htmlFor="mp-date">Date last seen</label>
            <input id="mp-date" type="date" value={form.date_last_seen} onChange={(e) => set("date_last_seen", e.target.value)} required />
          </div>
          <div className="help-field">
            <label htmlFor="mp-description">Description (appearance, clothing, etc.)</label>
            <textarea id="mp-description" rows="4" value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>
          <div className="help-field">
            <label htmlFor="mp-additional">Additional information</label>
            <textarea id="mp-additional" rows="3" value={form.additional_information} onChange={(e) => set("additional_information", e.target.value)} />
          </div>
          <button className="btn submit-help-button" type="submit" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit report"}
          </button>
        </form>
      </section>
    </main>
  );
}