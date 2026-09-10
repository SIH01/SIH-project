import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
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
      const user = await login(form);
      navigate(user.role === "organization" ? "/organization/dashboard" : "/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-card">
      <h1>Welcome back</h1>
      <p className="subtitle">Log in to explore the disaster map or manage your requests.</p>

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
          {submitting ? "Logging in…" : "Login"}
        </button>
      </form>

      <p className="auth-switch">New here? <Link to="/register">Create an account</Link></p>
      <p className="auth-switch">Administrator? <Link to="/admin/login">Admin login</Link></p>
    </div>
  );
}
