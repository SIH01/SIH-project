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
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/admin/stats")
      .then(({ data }) => setStats(data))
      .catch(() => setError("Live metrics are temporarily unavailable."));
  }, []);

  return (
    <main className="admin-page admin-dashboard-page">
      <section className="admin-dashboard-hero">
        <div>
          <p className="eyebrow">Operations overview</p>
          <h1>Admin Dashboard</h1>
          <p>Monitor response activity, review submissions, and keep the network ready to act.</p>
        </div>
        <div className="admin-session-badge">
          <span className="admin-session-dot" />
          <span><strong>{user?.name || "Administrator"}</strong><small>{user?.email}</small></span>
        </div>
      </section>

      {error && <div className="error-banner">{error}</div>}

      {stats ? (
        <section className="admin-metrics" aria-label="Platform metrics">
          {STAT_LABELS.map(([key, label]) => (
            <div key={key} className={`admin-metric admin-metric-${key}`}>
              <div className="admin-metric-value">
                {key === "funds_raised" ? Number(stats[key]).toLocaleString("en-IN") : stats[key]}
              </div>
              <div className="admin-metric-label">{label}</div>
            </div>
          ))}
        </section>
      ) : !error ? <div className="admin-metrics admin-metrics-loading" aria-label="Loading metrics"><span /><span /><span /><span /></div> : null}

      <section className="admin-action-section">
        <div className="admin-section-heading">
          <div><p className="eyebrow">Response tools</p><h2>Manage the platform</h2></div>
          <span>Choose a workspace</span>
        </div>
        <div className="admin-action-grid">
          <Link to="/admin/active-alerts" className="admin-action-card admin-action-alert"><span className="admin-action-icon">!</span><span><strong>Active Alerts</strong><small>Publish and monitor urgent events</small></span></Link>
          <Link to="/admin/assistance" className="admin-action-card"><span className="admin-action-icon">↗</span><span><strong>Assistance Requests</strong><small>Triage incoming community needs</small></span></Link>
          <Link to="/admin/relief-requests" className="admin-action-card"><span className="admin-action-icon">+</span><span><strong>Relief Requests</strong><small>Review direct support requests</small></span></Link>
          <Link to="/admin/organizations" className="admin-action-card"><span className="admin-action-icon">○</span><span><strong>Organizations</strong><small>Verify response partners</small></span></Link>
          <Link to="/admin/shelters" className="admin-action-card"><span className="admin-action-icon">⌂</span><span><strong>Shelter Review</strong><small>Approve safe places to stay</small></span></Link>
          <Link to="/admin/missing-persons" className="admin-action-card"><span className="admin-action-icon">⌕</span><span><strong>Missing People</strong><small>Review reports and updates</small></span></Link>
          <Link to="/admin/disasters" className="admin-action-card"><span className="admin-action-icon">◌</span><span><strong>Disasters</strong><small>Maintain the incident register</small></span></Link>
          <Link to="/admin/campaigns" className="admin-action-card"><span className="admin-action-icon">₹</span><span><strong>Campaigns</strong><small>Review fundraising activity</small></span></Link>
          <Link to="/admin/audit-logs" className="admin-action-card admin-action-muted"><span className="admin-action-icon">≡</span><span><strong>Audit Logs</strong><small>Trace administrative activity</small></span></Link>
        </div>
      </section>

      <section className="admin-dashboard-note">
        <span className="admin-note-mark">✓</span>
        <div><strong>Keep response information current</strong><p>Review active alerts and pending organization approvals first when a new incident is reported.</p></div>
      </section>
    </main>
  );
}