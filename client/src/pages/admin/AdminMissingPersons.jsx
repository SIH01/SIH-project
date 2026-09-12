import React, { useEffect, useState } from "react";
import { api } from "../../services/api";

const STATUSES = ["Reported", "Under Review", "Searching", "Located", "Closed"];

export default function AdminMissingPersons() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/missing-persons");
      setReports(data.reports || []);
    } catch (err) {
      setError("Could not load missing people reports.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id, status) {
    try {
      const { data } = await api.put(`/missing-persons/${id}`, { status });
      setReports((prev) => prev.map((r) => (r.id === id ? data.report : r)));
    } catch (err) {
      alert(err.response?.data?.error || "Could not update status.");
    }
  }

  async function deleteReport(report) {
    if (!window.confirm(`Delete the report for "${report.person_name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/missing-persons/${report.id}`);
      setReports((prev) => prev.filter((item) => item.id !== report.id));
    } catch (err) {
      alert(err.response?.data?.error || "Could not delete missing people report.");
    }
  }

  return (
    <div className="admin-page">
      <h1>Missing People Reports</h1>
      {error && <div className="error-banner">{error}</div>}
      {loading ? (
        <p>Loading…</p>
      ) : reports.length === 0 ? (
        <p style={{ color: "#5c6673" }}>No reports yet.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Person</th><th>Last Seen</th><th>Reporter</th><th>Description</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.person_name}</strong>{r.age ? ` (${r.age})` : ""}<br /><small>{r.last_known_location}</small></td>
                  <td>{new Date(r.date_last_seen).toLocaleDateString()}</td>
                  <td>{r.reporter_name}<br /><small>{r.reporter_contact}</small></td>
                  <td>{r.description || "—"}{r.additional_information && <><br /><small>{r.additional_information}</small></>}</td>
                  <td>
                    <select value={r.status} onChange={(e) => updateStatus(r.id, e.target.value)}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-outline-ink"
                      style={{ padding: "0.35rem 0.65rem", color: "var(--relief-dark)", borderColor: "var(--relief-dark)" }}
                      onClick={() => deleteReport(r)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}