import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function AdminLogin() {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await adminLogin(form);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid admin credentials.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-card" style={{ borderTop: "3px solid var(--ink)" }}>
      <h1>Administrator login</h1>
      <p className="subtitle">Separate from general-user and organization accounts.</p>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="email">Admin email</label>
          <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required />
        </div>
        <button className="btn btn-awareness" type="submit" disabled={submitting} style={{ width: "100%" }}>
          {submitting ? "Logging in…" : "Login as admin"}
        </button>
      </form>
    </div>
  );
}
