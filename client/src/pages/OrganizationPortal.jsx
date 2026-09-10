import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "./contactPortal.css";

const label = (value) => String(value || "").replace(/_/g, " ");

export default function OrganizationPortal() {
  const navigate = useNavigate();
  const [organization, setOrganization] = useState(null);
  const [requests, setRequests] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [reports, setReports] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ status: "", urgency: "", type: "", claimed: "" });
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      const results = await Promise.all([
        api.get("/organizations/me"),
        api.get("/org/requests", { params: filters }),
        api.get("/campaigns/mine"),
        api.get("/org/missing-persons"),
      ]);
      setOrganization(results[0].data.organization);
      setRequests(results[1].data.requests || []);
      setCampaigns(results[2].data.campaigns || []);
      setReports(results[3].data.reports || []);
      if (selected) {
        const detail = await api.get(`/org/requests/${selected.id}`);
        setSelected(detail.data.request);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Could not load the organization workspace.");
    }
  }

  useEffect(() => { load(); }, [filters.status, filters.urgency, filters.type, filters.claimed]);
  useEffect(() => { const timer = setInterval(load, 15000); return () => clearInterval(timer); }, [selected?.id]);

  async function selectRequest(id) {
    try { const { data } = await api.get(`/org/requests/${id}`); setSelected(data.request); }
    catch (err) { setError(err.response?.data?.error || "Could not load request details."); }
  }
  async function claim() {
    try { const { data } = await api.post(`/org/requests/${selected.id}/claim`); setSelected(data.request); load(); }
    catch (err) { setError(err.response?.data?.error || "Could not claim request."); }
  }
  async function updateStatus(event) {
    try { const { data } = await api.patch(`/org/requests/${selected.id}/status`, { status: event.target.value }); setSelected(data.request); load(); }
    catch (err) { setError(err.response?.data?.error || "Could not update request."); }
  }
  async function send(event) {
    event.preventDefault();
    if (!reply.trim()) return;
    try { const { data } = await api.post(`/org/requests/${selected.id}/messages`, { body: reply.trim() }); setSelected(data.request); setReply(""); }
    catch (err) { setError(err.response?.data?.error || "Could not send message."); }
  }
  async function escalate(id) {
    try { await api.post(`/org/missing-persons/${id}/escalate`); load(); }
    catch (err) { setError(err.response?.data?.error || "Could not escalate case."); }
  }

  const needsAttention = requests.filter((request) => ["new", "in_review"].includes(request.status)).length;
  const inProgress = requests.filter((request) => request.status === "in_progress").length;
  const resolved = requests.filter((request) => request.status === "resolved").length;
  const liveCampaigns = campaigns.filter((campaign) => campaign.verification_status === "Verified" && campaign.status === "Active");
  const pendingCampaigns = campaigns.filter((campaign) => campaign.verification_status === "Pending Verification");
  const setFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));

  return (
    <main className="org-workspace">
      <aside className="org-sidebar">
        <Link to="/organization/dashboard" className="org-brand">DisasterShield <span>RESPONSE DESK</span></Link>
        <p className="org-sidebar-label">Workspace</p>
        <nav className="org-nav">
          <a className="active" href="#overview">Overview</a>
          <a href="#requests">Response queue <b>{needsAttention}</b></a>
          <a href="#cases">Case management</a>
          <a href="#campaigns">Campaign review</a>
          <a href="#profile">Organization profile</a>
        </nav>
        <div className="org-sidebar-footer">
          <button type="button" onClick={() => navigate("/organization/campaigns")}>Campaign manager</button>
          <button type="button" onClick={() => { localStorage.removeItem("disastershield_auth"); window.location.href = "/"; }}>Sign out</button>
        </div>
      </aside>
      <section className="org-content">
        <header className="org-header"><div><p className="eyebrow">Operations console</p><h1>{organization?.name || "Organization workspace"}</h1><p>Coordinate response work, cases, and campaigns from one verified desk.</p></div><span className={`org-verification ${organization?.verification_status === "Verified" ? "verified" : "pending"}`}>{organization?.verification_status || "Pending review"}</span></header>
        {error && <div className="error-banner">{error}</div>}
        {organization?.verification_status !== "Verified" ? <section className="org-pending"><h2>Verification in progress</h2><p>Your organization account is awaiting admin approval. Workspace actions will unlock once verification is complete.</p></section> : <>
          <section id="overview" className="org-stat-grid"><article><small>Total requests</small><strong>{requests.length}</strong><span>Response queue</span></article><article><small>Needs attention</small><strong>{needsAttention}</strong><span>Awaiting first response</span></article><article><small>In progress</small><strong>{inProgress}</strong><span>Active interventions</span></article><article><small>Resolved</small><strong>{resolved}</strong><span>Closed cases</span></article></section>
          <section id="requests" className="org-panel"><div className="org-panel-heading"><div><p className="eyebrow">Response queue</p><h2>Incoming help requests</h2></div><div className="org-filters"><select aria-label="Filter by urgency" value={filters.urgency} onChange={(event) => setFilter("urgency", event.target.value)}><option value="">All urgency</option><option value="critical">Critical</option><option value="medium">Medium</option><option value="low">Low</option></select><select aria-label="Filter by status" value={filters.status} onChange={(event) => setFilter("status", event.target.value)}><option value="">All status</option><option value="new">New</option><option value="in_review">In review</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option></select><select aria-label="Filter by routing" value={filters.claimed} onChange={(event) => setFilter("claimed", event.target.value)}><option value="">All routing</option><option value="false">Unclaimed pool</option><option value="true">Claimed</option></select></div></div><div className="org-queue"><div>{requests.length === 0 ? <p className="org-empty">No requests match the current queue.</p> : requests.map((request) => <button type="button" className={`org-queue-item ${selected?.id === request.id ? "selected" : ""}`} key={request.id} onClick={() => selectRequest(request.id)}><span><b>{request.name}</b><small>{label(request.type)} - {request.location_text || "Location not provided"}</small></span><em className={`org-status ${request.status}`}>{label(request.status)}</em></button>)}</div><div className="org-request-detail">{selected ? <><p className="eyebrow">Request {selected.request_id || selected.id}</p><h3>{selected.name}</h3><p>{selected.description}</p><small>{selected.phone || "No phone shared"} - {selected.location_text || "Location not provided"}</small><div className="org-actions"><button className="btn btn-awareness compact-button" type="button" onClick={claim}>Claim request</button><select value={selected.status} onChange={updateStatus}><option value="in_review">In review</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option></select></div><div className="org-thread">{(selected.messages || []).map((message) => <p key={message.id}><b>{message.sender_role === "organization" ? "Your team" : "Requester"}</b>{message.body}</p>)}</div><form className="org-reply" onSubmit={send}><input value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Message the requester" /><button className="btn btn-ink" type="submit">Send</button></form></> : <p className="org-empty">Select a request to review and reply.</p>}</div></div></section>
          <div className="org-two-column"><section id="cases" className="org-panel"><div className="org-panel-heading"><div><p className="eyebrow">Case management</p><h2>Missing-person coordination</h2></div><strong>{reports.length}</strong></div>{reports.length === 0 ? <p className="org-empty">No cases in your operating region.</p> : reports.map((report) => <div className="org-list-row" key={report.id}><div><b>{report.person_name}</b><small>{report.last_known_location} - {report.status}</small></div><button className="btn btn-outline-ink compact-button" type="button" onClick={() => escalate(report.id)}>Escalate</button></div>)}</section><section id="campaigns" className="org-panel"><div className="org-panel-heading"><div><p className="eyebrow">Campaign review</p><h2>Fundraising</h2></div><button className="btn btn-awareness compact-button" type="button" onClick={() => navigate("/organization/campaigns")}>Manage</button></div><p className="org-campaign-summary">{liveCampaigns.length} live - {pendingCampaigns.length} pending review</p>{campaigns.slice(0, 4).map((campaign) => <div className="org-list-row" key={campaign.id}><div><b>{campaign.title}</b><small>Raised {Number(campaign.amount_raised || 0).toLocaleString("en-IN")} of {Number(campaign.target_amount || 0).toLocaleString("en-IN")}</small></div><em className="org-status pending">{campaign.verification_status}</em></div>)}</section></div>
          <section id="profile" className="org-profile"><div><p className="eyebrow">Organization profile</p><h2>{organization.name}</h2><p>{organization.description || "Keep your contact details and operating areas current for better routing."}</p></div><a className="btn btn-outline-ink compact-button" href="#profile">Review details</a></section>
        </>}
      </section>
    </main>
  );
}
