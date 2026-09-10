import React, { useEffect, useState } from "react";
import { api } from "../../services/api";

// New page for Sections 18-20 of the spec: an organization's dashboard of
// nearby requests (50km default) with the ability to claim/respond to one.
// Reads from the new /api/org-matching endpoints only — it doesn't touch
// AdminAssistanceList, the shelters flow, or anything else already built.

const RADIUS_OPTIONS = [10, 25, 50, 100];

function formatCategory(value) {
  return (value || "").replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

export default function OrganizationRequestMatching() {
  const [organization, setOrganization] = useState(null);
  const [radius, setRadius] = useState(50);
  const [nearby, setNearby] = useState([]);
  const [mine, setMine] = useState([]);
  const [directed, setDirected] = useState([]);
  const [view, setView] = useState("nearby");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadOrg() {
    const { data } = await api.get("/organizations/me");
    setOrganization(data.organization);
    return data.organization;
  }

  async function loadNearby(currentRadius) {
    const { data } = await api.get("/org-matching/nearby", { params: { radius: currentRadius } });
    setNearby(data.requests || []);
  }

  async function loadMine() {
    const { data } = await api.get("/org-matching/mine");
    setMine(data.requests || []);
  }
  async function loadDirected() {
    const { data } = await api.get("/org/requests", { params: { directed: "true" } });
    setDirected(data.requests || []);
  }

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const org = await loadOrg();
      if (org.verification_status === "Verified") {
        await Promise.all([loadNearby(radius), loadMine(), loadDirected()]);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Could not load your organization's requests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function changeRadius(value) {
    setRadius(value);
    try {
      await loadNearby(value);
    } catch (err) {
      setError(err.response?.data?.error || "Could not reload nearby requests.");
    }
  }

  async function claim(request, status) {
    setMessage("");
    setError("");
    try {
      await api.post(`/org-matching/${request.source}/${request.id}/claim`, { status });
      setMessage(status === "in_progress" ? "Request claimed — it now shows under \"My accepted requests\"." : "Request updated.");
      await Promise.all([loadNearby(radius), loadMine(), loadDirected()]);
    } catch (err) {
      setError(err.response?.data?.error || "Could not update this request — it may have just been claimed by another organization.");
    }
  }

  if (loading) return <div className="org-page"><div className="org-panel" style={{ padding: "1.5rem" }}><p className="dashboard-muted">Loading response queue…</p></div></div>;

  if (organization && organization.verification_status !== "Verified") {
    return (
      <div className="org-page">
        <div className="org-pending-card">
          <h1>Nearby requests</h1>
          <p className="dashboard-muted">Your organization is awaiting admin approval before you can view or respond to requests.</p>
        </div>
      </div>
    );
  }

  const list = view === "nearby" ? nearby : view === "directed" ? directed : mine;

  return (
    <div className="org-page">
      <header className="org-page-header"><div><p className="eyebrow">Response queue</p><h1>Incoming help requests</h1>
        <p className="dashboard-muted">
          People and disaster relief requests within {radius}km of {organization?.name || "your organization"}'s
          registered location. Claiming a request assigns it to you so other organizations see it's being handled.
        </p></div><span className="org-header-chip">Matching workspace</span></header>

        {error && <div className="error-banner">{error}</div>}
        {message && <div className="modal-message">{message}</div>}

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap", margin: "1rem 0" }}>
          <strong style={{ fontSize: "0.85rem" }}>Radius:</strong>
          {RADIUS_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={`btn compact-button ${radius === option ? "btn-awareness" : "btn-outline-ink"}`}
              onClick={() => changeRadius(option)}
            >
              {option}km
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <button type="button" className={`btn compact-button ${view === "nearby" ? "btn-awareness" : "btn-outline-ink"}`} onClick={() => setView("nearby")}>
            Nearby ({nearby.length})
          </button>
          <button type="button" className={`btn compact-button ${view === "mine" ? "btn-awareness" : "btn-outline-ink"}`} onClick={() => setView("mine")}>
            My accepted requests ({mine.length})
          </button>
          <button type="button" className={`btn compact-button ${view === "directed" ? "btn-awareness" : "btn-outline-ink"}`} onClick={() => setView("directed")}>
            Directed to us ({directed.length})
          </button>
        </div>
      <div className="org-panel" style={{ padding: "1.5rem" }}>
        {list.length === 0 ? (
          <p className="dashboard-muted">
            {view === "nearby" ? "No open requests within this radius right now." : "You haven't claimed any requests yet."}
          </p>
        ) : (
          list.map((request) => (
            <div className="admin-list-item" key={`${request.source}-${request.id}`}>
              <div>
                <strong>{formatCategory(request.category)}</strong>
                {request.distance_km != null && <span className="dashboard-muted"> · {request.distance_km.toFixed(1)}km away</span>}
                <div className="dashboard-muted">
                  {request.name}
                  {request.phone && ` · ${request.phone}`}
                  {request.location_text && ` · ${request.location_text}`}
                </div>
                <div style={{ marginTop: "0.3rem" }}>{request.description}</div>
              </div>
              <div>
                <span className={`status-pill status-${request.status}`}>{request.status?.replace(/_/g, " ")}</span>
                {view === "nearby" && !request.claimed_by_org_id && (
                  <button className="btn btn-awareness compact-button" onClick={() => claim(request, "in_progress")}>Claim</button>
                )}
                {view === "mine" && request.status !== "resolved" && request.status !== "closed" && (
                  <button className="btn btn-outline-ink compact-button" onClick={() => claim(request, "resolved")}>Mark resolved</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
