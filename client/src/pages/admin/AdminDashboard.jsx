import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../services/api";

const STAT_LABELS = [
  ["total_users", "Total Users"], ["total_disasters", "Total Disasters"],
  ["active_disasters", "Active Disasters"], ["total_relief_requests", "Assistance Requests"],
  ["pending_relief_requests", "Pending Requests"], ["completed_requests", "Resolved Requests"],
  ["verified_organizations", "Verified Orgs"], ["pending_organizations", "Pending Orgs"],
  ["active_campaigns", "Active Campaigns"], ["funds_raised", "Funds Raised (₹)"],
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/admin/stats").then(({ data }) => setStats(data)).catch(() => setStats(null));
  }, []);

  return (
    <div style={{ maxWidth: "1000px", margin: "3rem auto", padding: "0 2rem" }}>
      <h1 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>Admin Dashboard</h1>
      <p>Signed in as {user?.email} (role: {user?.role}).</p>

      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "0.75rem", margin: "1.5rem 0" }}>
          {STAT_LABELS.map(([key, label]) => (
            <div key={key} style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "8px", padding: "0.9rem" }}>
              <div style={{ fontSize: "1.4rem", fontWeight: 800 }}>
                {key === "funds_raised" ? Number(stats[key]).toLocaleString("en-IN") : stats[key]}
              </div>
              <div style={{ fontSize: "0.78rem", color: "#5c6673" }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: "1rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <Link to="/admin/disasters" className="btn btn-awareness">Manage Disasters</Link>
        <Link to="/admin/active-alerts" className="btn btn-relief">Active Alerts</Link>
        <Link to="/admin/assistance" className="btn btn-awareness">Assistance Requests</Link>
        <Link to="/admin/relief-requests" className="btn btn-awareness">Relief Requests</Link>
        <Link to="/admin/shelters" className="btn btn-awareness">Shelter Review</Link>
        <Link to="/admin/organizations" className="btn btn-awareness">Organizations</Link>
        <Link to="/admin/missing-persons" className="btn btn-awareness">Missing Persons</Link>
        <Link to="/admin/campaigns" className="btn btn-awareness">Campaigns</Link>
        <Link to="/admin/audit-logs" className="btn btn-outline-ink">Audit Logs</Link>
      </div>

      <p style={{ marginTop: "2rem", color: "#5c6673" }}>
        Review organization access, shelter submissions, missing person reports, fundraising campaigns,
        and community relief needs from one place.
      </p>
    </div>
  );
}