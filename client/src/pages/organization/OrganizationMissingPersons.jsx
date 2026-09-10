import React, { useEffect, useState } from "react";
import { api } from "../../services/api";

const statuses = ["Reported", "Under Review", "Searching", "Located", "Closed"];

export default function OrganizationMissingPersons() {
  const [cases, setCases] = useState([]);
  const [selected, setSelected] = useState(null);
  const [tip, setTip] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/org/missing-persons");
      setCases(data.reports || []);
    } catch (err) {
      setError(err.response?.data?.error || "Could not load case management data.");
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function updateCase(status, findings) {
    try {
      await api.patch(`/org/missing-persons/${selected.id}`, { status, findings });
      setSelected(null); setTip(""); await load();
    } catch (err) { setError(err.response?.data?.error || "Could not update this case."); }
  }

  return (
    <div className="org-page">
      <header className="org-page-header">
        <div><p className="eyebrow">Case management</p><h1>Missing-person coordination</h1><p>Review cases shared with verified response partners and pass findings to the admin coordination team.</p></div>
        <span className="org-header-chip">{cases.length} active cases</span>
      </header>
      {error && <div className="error-banner">{error}</div>}
      <div className="org-panel org-case-layout">
        <div className="org-case-list">
          {loading ? <p className="dashboard-muted">Loading cases…</p> : cases.length === 0 ? <div className="empty-state"><h2>No cases assigned</h2><p>Relevant cases will appear here after admin triage.</p></div> : cases.map((item) => (
            <button type="button" key={item.id} className={`org-case-row ${selected?.id === item.id ? "selected" : ""}`} onClick={() => setSelected(item)}>
              <div><strong>{item.person_name}</strong><small>{item.last_known_location}</small><small>Last seen {new Date(item.date_last_seen).toLocaleDateString()}</small></div>
              <span className={`status-pill status-${item.status.toLowerCase().replaceAll(" ", "-")}`}>{item.status}</span>
            </button>
          ))}
        </div>
        <div className="org-case-detail">
          {selected ? <><p className="eyebrow">Case #{selected.id}</p><h2>{selected.person_name}</h2><p className="dashboard-muted">{selected.last_known_location} · Age {selected.age || "unknown"}</p><div className="org-case-facts"><strong>Report details</strong><p>{selected.description || "No additional description provided."}</p><strong>Coordination notes</strong><p>{selected.findings || "No findings have been shared yet."}</p></div><label className="field"><span>Add finding or tip</span><textarea value={tip} onChange={(e) => setTip(e.target.value)} rows={4} placeholder="Record verified sightings, search notes, or useful leads." /></label>          <div className="org-action-row"><select value={selected.status} onChange={(e) => updateCase(e.target.value, tip || selected.findings)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select><button type="button" className="btn btn-awareness" onClick={() => updateCase(selected.status, tip)} disabled={!tip.trim()}>Share finding</button><button type="button" className="btn btn-outline-ink" onClick={async () => { try { await api.patch(`/org/missing-persons/${selected.id}`, { escalation_status: "escalated", escalation_notes: tip || "Escalated by organization." }); setSelected(null); setTip(""); await load(); } catch (err) { setError(err.response?.data?.error || "Could not escalate this case."); } }}>Escalate to admins</button></div></> : <div className="empty-state"><h2>Select a case</h2><p>Case details and coordination actions will appear here.</p></div>}
        </div>
      </div>
    </div>
  );
}
