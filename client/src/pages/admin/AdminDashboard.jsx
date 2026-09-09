import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function AdminDashboard() {
  const { user } = useAuth();
  return (
    <div style={{ maxWidth: "700px", margin: "3rem auto", padding: "0 2rem" }}>
      <h1 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>Admin Dashboard</h1>
      <p>Signed in as {user?.email} (role: {user?.role}).</p>

      <div style={{ marginTop: "2rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <Link to="/admin/disasters" className="btn btn-awareness">Manage Disasters</Link>
        <Link to="/admin/active-alerts" className="btn btn-relief">Active Alerts</Link>
        <Link to="/admin/assistance" className="btn btn-awareness">Assistance Requests</Link>
        <Link to="/admin/relief-requests" className="btn btn-awareness">Relief Requests</Link>
        <Link to="/admin/shelters" className="btn btn-awareness">Shelter Review</Link>
        <Link to="/admin/organizations" className="btn btn-awareness">Organizations</Link>
      </div>

      <p style={{ marginTop: "2rem", color: "#5c6673" }}>
        Review organization access, shelter submissions, and community relief needs from one place.
      </p>
    </div>
  );
}