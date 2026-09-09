import React from "react";
import ComingSoon from "../components/ComingSoon.jsx";

export default function RegisterOrganization() {
  return (
    <ComingSoon
      title="Register an organization"
      stageNote="Organization registration is not available until the organization API is enabled."
    />
  );
}
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { ORG_TYPES, ASSISTANCE_CATEGORIES } from "../utils/organizationOptions";

const fieldStyle = {
  width: "100%", padding: "0.6rem 0.8rem", border: "1px solid var(--line)",
  borderRadius: "4px", fontSize: "0.95rem", fontFamily: "var(--font-body)",
};
const labelStyle = { display: "block", fontWeight: 600, marginBottom: "0.35rem", fontSize: "0.9rem" };
const wrap = { marginBottom: "1.1rem" };

const EMPTY = {
  name: "", type: ORG_TYPES[0], description: "", email: "", password: "", confirmPassword: "",
  phone: "", website: "", address: "", operating_areas: "",
  registration_info: "", documents: "", representative_name: "", representative_contact: "",
};

export default function RegisterOrganization() {
  const navigate = useNavigate();
  const { registerOrganization } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleCategory(cat) {
    setCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (categories.length === 0) {
      setError("Select at least one assistance category.");
      return;
    }
    setSubmitting(true);
    try {
      // Backend only stores one "documents" field — fold the registration/
      // legal info in alongside any document links the user provided.
      const documents = [form.registration_info, form.documents].filter(Boolean).join("\n\n");
      await registerOrganization({ ...form, documents, assistance_categories: categories });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.error || "Could not submit registration.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div style={{ maxWidth: "560px", margin: "4rem auto", padding: "0 2rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>Application submitted</h1>
        <p style={{ color: "#5c6673", marginBottom: "1.5rem" }}>
          An admin will review your organization's details. You'll be able to log in once verified —
          look out for a status update.
        </p>
        <button className="btn btn-awareness" onClick={() => navigate("/")}>Back to home</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "640px", margin: "3rem auto", padding: "0 2rem" }}>
      <h1 style={{ fontSize: "1.8rem", marginBottom: "0.4rem" }}>Register your organization</h1>
      <p style={{ color: "#5c6673", marginBottom: "1.75rem" }}>
        NGOs, charities, and relief groups register here. An admin reviews every application before
        your organization can respond to requests or create fundraising campaigns.
      </p>

      {error && <div className="error-banner" style={{ marginBottom: "1.25rem" }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>Organization details</h2>

        <div style={wrap}>
          <label style={labelStyle}>Organization name</label>
          <input style={fieldStyle} value={form.name} onChange={(e) => set("name", e.target.value)} required />
        </div>

        <div style={wrap}>
          <label style={labelStyle}>Organization type</label>
          <select style={fieldStyle} value={form.type} onChange={(e) => set("type", e.target.value)}>
            {ORG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div style={wrap}>
          <label style={labelStyle}>Description</label>
          <textarea style={{ ...fieldStyle, minHeight: "80px" }} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <div style={{ ...wrap, flex: 1 }}>
            <label style={labelStyle}>Email (used to log in)</label>
            <input style={fieldStyle} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
          </div>
          <div style={{ ...wrap, flex: 1 }}>
            <label style={labelStyle}>Phone</label>
            <input style={fieldStyle} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <div style={{ ...wrap, flex: 1 }}>
            <label style={labelStyle}>Password</label>
            <input style={fieldStyle} type="password" value={form.password} onChange={(e) => set("password", e.target.value)} required minLength={8} />
          </div>
          <div style={{ ...wrap, flex: 1 }}>
            <label style={labelStyle}>Confirm password</label>
            <input style={fieldStyle} type="password" value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} required />
          </div>
        </div>

        <div style={wrap}>
          <label style={labelStyle}>Website (optional)</label>
          <input style={fieldStyle} value={form.website} onChange={(e) => set("website", e.target.value)} />
        </div>

        <div style={wrap}>
          <label style={labelStyle}>Address</label>
          <input style={fieldStyle} value={form.address} onChange={(e) => set("address", e.target.value)} />
        </div>

        <div style={wrap}>
          <label style={labelStyle}>Operating areas</label>
          <input style={fieldStyle} placeholder="e.g. Cachar, Karimganj, Hailakandi districts" value={form.operating_areas} onChange={(e) => set("operating_areas", e.target.value)} />
        </div>

        <h2 style={{ fontSize: "1.1rem", margin: "1.5rem 0 0.75rem" }}>Assistance categories</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", marginBottom: "1.5rem" }}>
          {ASSISTANCE_CATEGORIES.map((cat) => (
            <label key={cat} style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.88rem", border: "1px solid var(--line)", padding: "0.4rem 0.7rem", borderRadius: "999px" }}>
              <input type="checkbox" checked={categories.includes(cat)} onChange={() => toggleCategory(cat)} />
              {cat}
            </label>
          ))}
        </div>

        <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>Verification</h2>

        <div style={wrap}>
          <label style={labelStyle}>Registration / legal information</label>
          <textarea style={{ ...fieldStyle, minHeight: "70px" }} placeholder="Registration number, governing body, etc." value={form.registration_info} onChange={(e) => set("registration_info", e.target.value)} />
        </div>

        <div style={wrap}>
          <label style={labelStyle}>Supporting documents</label>
          <input style={fieldStyle} placeholder="Link(s) to registration certificate, ID, etc." value={form.documents} onChange={(e) => set("documents", e.target.value)} />
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <div style={{ ...wrap, flex: 1 }}>
            <label style={labelStyle}>Authorized representative name</label>
            <input style={fieldStyle} value={form.representative_name} onChange={(e) => set("representative_name", e.target.value)} required />
          </div>
          <div style={{ ...wrap, flex: 1 }}>
            <label style={labelStyle}>Representative contact</label>
            <input style={fieldStyle} value={form.representative_contact} onChange={(e) => set("representative_contact", e.target.value)} required />
          </div>
        </div>

        <button className="btn btn-awareness" type="submit" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit application"}
        </button>
      </form>
    </div>
  );
}
