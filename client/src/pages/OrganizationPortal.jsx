import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

const EMPTY_STATS = { total: 0, pending: 0, in_progress: 0, resolved: 0 };

function label(value) {
  return String(value || "").replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function OrganizationPortal() {
  const [organization, setOrganization] = useState(null);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [campaigns, setCampaigns] = useState([]);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/organizations/me").then(async ({ data: org }) => {
      setOrganization(org.organization);
      if (org.organization.verification_status !== "Verified") return;
      const [dashboard, queue, campaignData] = await Promise.all([
        api.get("/org/dashboard/stats"),
        api.get("/org/requests", { params: { limit: 5 } }),
        api.get("/campaigns/mine"),
      ]);
      setStats({ ...EMPTY_STATS, ...(dashboard.data.stats || {}) });
      setRequests(queue.data.requests || []);
      setCampaigns(campaignData.data.campaigns || []);
    }).catch((err) => {
      setError(err.response?.data?.error || "Could not load organization overview.");
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="org-page"><div className="org-panel org-loading">Loading response console…</div></div>;

  if (organization && organization.verification_status !== "Verified") {
    return <div className="org-page"><div className="org-pending-card"><span className="org-pending-icon">!</span><p className="eyebrow">Access is limited</p><h1>Your organization is under review</h1><p>DisasterShield is reviewing your registration. The response queue, case management, and campaign publishing tools will unlock after approval.</p><Link className="btn btn-outline-ink" to="/organization/profile">Review organization profile</Link></div></div>;
  }

  return (
    <div className="org-page">
      <header className="org-page-header">
        <div><p className="eyebrow">Operations overview</p><h1>Good to see you, {organization?.name || "response team"}</h1><p>Monitor incoming needs, coordinate cases, and keep your public campaigns moving.</p></div>
        <span className="org-header-chip">Live workspace</span>
      </header>
      {error && <div className="error-banner">{error}</div>}
      <section className="org-stat-grid">
        {[["Total requests", stats.total, "All matching and directed requests"], ["Needs attention", stats.pending, "Awaiting first response"], ["In progress", stats.in_progress, "Active response work"], ["Resolved", stats.resolved, "Closed with care"]].map(([name, value, note]) => <div className="org-stat-card" key={name}><small>{name}</small><strong>{value}</strong><span>{note}</span></div>)}
      </section>
      <section className="org-overview-grid">
        <div className="org-panel">
          <div className="org-panel-heading"><div><p className="eyebrow">Response queue</p><h2>Latest requests</h2></div><Link to="/organization/requests">Open queue →</Link></div>
          {requests.length === 0 ? <div className="empty-state"><h2>Queue is clear</h2><p>New matching and directed requests will appear here.</p></div> : <div className="org-compact-list">{requests.map((request) => <Link to="/organization/requests" className="org-compact-row" key={request.id}><div><strong>{request.name}</strong><small>{label(request.type)} · {request.location_text || "Location not shared"}</small></div><span className={`status-pill status-${String(request.status).replaceAll("_", "-")}`}>{label(request.status)}</span></Link>)}</div>}
        </div>
        <div className="org-panel">
          <div className="org-panel-heading"><div><p className="eyebrow">Campaign review</p><h2>Fundraising health</h2></div><Link to="/organization/campaigns">Manage campaigns →</Link></div>
          <div className="org-campaign-summary"><strong>{campaigns.length}</strong><span>Total campaigns</span><div><b>{campaigns.filter((campaign) => ["Approved", "Active", "Verified"].includes(campaign.status) || ["Approved", "Verified"].includes(campaign.verification_status)).length}</b> approved or live</div><div><b>{campaigns.filter((campaign) => ["Pending Review", "Pending Verification"].includes(campaign.status) || ["Pending Review", "Pending Verification"].includes(campaign.verification_status)).length}</b> pending review</div></div>
        </div>
      </section>
      <section className="org-callout"><div><p className="eyebrow">Coordination desk</p><h2>Keep every response accountable.</h2><p>Use case management to share verified findings with admins and escalate urgent missing-person reports.</p></div><Link className="btn btn-awareness" to="/organization/missing-persons">Open case management</Link></section>
    </div>
  );
}
