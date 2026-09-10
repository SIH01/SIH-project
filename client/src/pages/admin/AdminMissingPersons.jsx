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
      setError("Could not load missing person reports.");
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

  return (
    <div className="admin-page">
      <h1>Missing Person Reports</h1>
      {error && <div className="error-banner">{error}</div>}
      {loading ? (
        <p>Loading…</p>
      ) : reports.length === 0 ? (
        <p style={{ color: "#5c6673" }}>No reports yet.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Person</th><th>Last Seen</th><th>Reporter</th><th>Description</th><th>Status</th></tr>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}