import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function OrganizationLogin() {
  const { organizationLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await organizationLogin(form);
      navigate("/organization/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Organization login failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-card">
      <h1>Organization login</h1>
      <p className="subtitle">Sign in to respond to nearby assistance requests.</p>
      {error && <div className="error-banner">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required />
        </div>
        <button className="btn btn-awareness" type="submit" disabled={submitting} style={{ width: "100%" }}>
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="auth-switch"><Link to="/organizations">Back to organizations</Link></p>
    </div>
  );
}