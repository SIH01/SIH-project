import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import OrganizationProfileEditor from "../components/OrganizationProfileEditor.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import NotificationBell from "../components/NotificationBell.jsx";
import "./contactPortal.css";

function formatCategory(value) { return String(value || "").replace(/_/g, " ").replace(/^\w/, (letter) => letter.toUpperCase()); }

export default function OrganizationPortal() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState({ status: "", urgency: "", type: "", search: "" });
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      const { data } = await api.get("/org/requests", { params: filter });
      setRequests(data.requests || []);
      if (selected) {
        const current = await api.get(`/org/requests/${selected.id}`);
        setSelected(current.data.request);
      }
    } catch (err) { setError(err.response?.data?.error || "Could not load the organization inbox."); }
  }

  useEffect(() => { load(); }, [filter.status, filter.urgency, filter.type, filter.search]);
  useEffect(() => { const timer = setInterval(load, 15000); return () => clearInterval(timer); }, [filter.status, filter.urgency, filter.type, filter.search, selected?.id]);

  async function openRequest(request) {
    try { const { data } = await api.get(`/org/requests/${request.id}`); setSelected(data.request); setError(""); }
    catch (err) { setError(err.response?.data?.error || "Could not load request details."); }
  }
  async function send(event) {
    event.preventDefault(); if (!reply.trim() || !selected) return;
    try { const { data } = await api.post(`/org/requests/${selected.id}/messages`, { body: reply }); setSelected(data.request); setReply(""); load(); }
    catch (err) { setError(err.response?.data?.error || "Could not send reply."); }
  }
  async function setStatus(status) {
    try { const { data } = await api.patch(`/org/requests/${selected.id}/status`, { status }); setSelected(data.request); load(); }
    catch (err) { setError(err.response?.data?.error || "Could not update status."); }
  }
  async function claim() {
    try { const { data } = await api.post(`/org/requests/${selected.id}/claim`); setSelected(data.request); load(); }
    catch (err) { setError(err.response?.data?.error || "Could not claim request."); }
  }

  function handleLogout() {
    logout();
    navigate("/org/login");
  }

  const pending = requests.filter((item) => item.status === "new" || item.status === "in_review").length;
  const inProgress = requests.filter((item) => item.status === "in_progress" || item.status === "in_review").length;
  const resolved = requests.filter((item) => item.status === "resolved").length;

  return (
    <main className="portal-shell">
      <aside className="portal-sidebar">
        <Link to="/organization/dashboard" className="portal-brand">DisasterShield <span>ORG PORTAL</span></Link>
        <nav><a className="portal-nav-active" href="#overview">Overview</a><a href="#inbox">Incoming requests <b>{pending}</b></a><a href="#profile">Organization profile</a></nav>
        <div className="portal-sidebar-footer"><Link to="/organizations">View public directory</Link><Link to="/organization/requests">Nearby requests</Link><Link to="/organization/campaigns">Campaigns</Link></div>
      </aside>
      <section className="portal-main">
        <header className="portal-topbar"><div><p className="eyebrow">Verified response desk</p><h1>{user?.name || "Organization dashboard"}</h1></div><div className="org-dashboard-header-actions"><span className="verified-badge">✓ Admin verified</span><NotificationBell /><button type="button" className="nav-logout" onClick={handleLogout}>Logout</button></div></header>
        {error && <div className="error-banner">{error}</div>}
        <section id="overview" className="portal-stats"><div><small>Total requests</small><strong>{requests.length}</strong><span>Matching and assigned</span></div><div><small>Needs attention</small><strong>{pending}</strong><span>Waiting for response</span></div><div><small>In progress</small><strong>{inProgress}</strong><span>Active conversations</span></div><div><small>Resolved</small><strong>{resolved}</strong><span>Closed with care</span></div></section>
        <section id="inbox" className="portal-inbox">
          <div className="inbox-toolbar"><div><p className="eyebrow">Response queue</p><h2>Incoming Get Help requests</h2></div><div className="filter-row"><input aria-label="Search requests" placeholder="Search" value={filter.search} onChange={(event) => setFilter({ ...filter, search: event.target.value })} /><select aria-label="Filter by urgency" value={filter.urgency} onChange={(event) => setFilter({ ...filter, urgency: event.target.value })}><option value="">All urgency</option><option value="critical">Critical</option><option value="medium">Medium</option><option value="low">Low</option></select><select aria-label="Filter by status" value={filter.status} onChange={(event) => setFilter({ ...filter, status: event.target.value })}><option value="">All status</option><option value="new">New</option><option value="in_review">In review</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option></select></div></div>
          <div className="portal-content"><div className="portal-request-list">{requests.length === 0 ? <p className="dashboard-muted">No matching requests right now.</p> : requests.map((request) => <button type="button" className={`portal-request-item ${selected?.id === request.id ? "selected" : ""}`} key={request.id} onClick={() => openRequest(request)}><span><strong>{formatCategory(request.type)}</strong><small>{request.name} · {request.location_text || "Location not provided"}</small></span><b className={`status-pill status-${request.status}`}>{request.status?.replace(/_/g, " ")}</b></button>)}</div><div className="portal-request-detail">{selected ? <><div className="thread-header"><div><p className="eyebrow">Request {selected.request_id}</p><h2>{selected.name}</h2><p>{selected.location_text || "Location not provided"}</p></div><select aria-label="Update request status" value={selected.status} onChange={(event) => setStatus(event.target.value)}><option value="new">New</option><option value="in_review">In review</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select></div><div className="thread-message"><strong>Citizen request</strong><p>{selected.description}</p></div>{!selected.actionable && <div className="modal-message">This request is currently claimed by another organization.</div>}{selected.actionable && !selected.claimed_by_org_id && <button className="btn btn-relief" type="button" onClick={claim}>Claim request</button>}<div className="thread-messages">{(selected.messages || []).map((message) => <div className={`thread-message ${message.sender_role === "organization" ? "organization-message" : ""}`} key={message.id}><strong>{message.sender_role === "organization" ? "Your organization" : "Citizen"}</strong><p>{message.body}</p></div>)}</div>{selected.actionable && <form className="reply-box" onSubmit={send}><textarea rows="3" placeholder="Write a response…" value={reply} onChange={(event) => setReply(event.target.value)} /><button className="btn btn-awareness" type="submit">Send reply</button></form>}</> : <div className="portal-empty-detail"><h2>Select a request</h2><p>Choose an incoming request to review its details, claim it, and respond.</p></div>}</div></div>
        </section>
        <section id="profile" className="portal-profile"><div className="inbox-toolbar"><div><p className="eyebrow">Organization settings</p><h2>Profile and services</h2></div><span className="dashboard-muted">Changes are saved to your verified organization account.</span></div><OrganizationProfileEditor /></section>
      </section>
    </main>
  );
}
