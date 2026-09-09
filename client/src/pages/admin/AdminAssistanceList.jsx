import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import { REQUEST_STATUSES, badgeForStatus } from "../../utils/assistanceOptions";

export default function AdminAssistanceList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/assistance");
      setRequests(data.requests);
    } catch (err) {
      setError("Could not load assistance requests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleStatusChange(id, status) {
    try {
      const { data } = await api.put(`/assistance/${id}`, { status });
      setRequests((prev) => prev.map((r) => (r.id === id ? data.request : r)));
    } catch (err) {
      alert(err.response?.data?.error || "Could not update status.");
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete the request from "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/assistance/${id}`);
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || "Could not delete request.");
    }
  }

  const visible = statusFilter === "All" ? requests : requests.filter((r) => r.status === statusFilter);

  return (
    <div style={{ maxWidth: "1100px", margin: "3rem auto", padding: "0 2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <h1 style={{ fontSize: "1.8rem" }}>Assistance Requests</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: "0.5rem 0.7rem", border: "1px solid var(--line)", borderRadius: "4px" }}
        >
          <option value="All">All Statuses</option>
          {REQUEST_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {loading ? (
        <p>Loading…</p>
      ) : visible.length === 0 ? (
        <p style={{ color: "#5c6673" }}>No requests match this filter.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--line)", textAlign: "left" }}>
              <th style={{ padding: "0.6rem" }}>Requester</th>
              <th style={{ padding: "0.6rem" }}>Type</th>
              <th style={{ padding: "0.6rem" }}>Location</th>
              <th style={{ padding: "0.6rem" }}>Contact</th>
              <th style={{ padding: "0.6rem" }}>Submitted</th>
              <th style={{ padding: "0.6rem" }}>Status</th>
              <th style={{ padding: "0.6rem" }}></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.id} style={{ borderBottom: "1px solid var(--line)" }}>
                <td style={{ padding: "0.6rem", fontWeight: 600 }}>{r.requester_name}</td>
                <td style={{ padding: "0.6rem" }}>{r.request_type}</td>
                <td style={{ padding: "0.6rem" }}>{r.location_name}</td>
                <td style={{ padding: "0.6rem", fontSize: "0.85rem" }}>
                  {r.contact_phone && <div>{r.contact_phone}</div>}
                  {r.contact_email && <div>{r.contact_email}</div>}
                </td>
                <td style={{ padding: "0.6rem" }}>{new Date(r.created_at).toLocaleDateString()}</td>
                <td style={{ padding: "0.6rem" }}>
                  <span className={`badge ${badgeForStatus(r.status)}`} style={{ marginRight: "0.5rem" }}>
                    {r.status}
                  </span>
                  <select
                    value={r.status}
                    onChange={(e) => handleStatusChange(r.id, e.target.value)}
                    style={{ padding: "0.3rem 0.5rem", border: "1px solid var(--line)", borderRadius: "4px", fontSize: "0.8rem" }}
                  >
                    {REQUEST_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td style={{ padding: "0.6rem" }}>
                  <button
                    onClick={() => handleDelete(r.id, r.requester_name)}
                    className="btn btn-outline-ink"
                    style={{ padding: "0.35rem 0.8rem", fontSize: "0.85rem", color: "var(--relief-dark)", borderColor: "var(--relief-dark)" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
