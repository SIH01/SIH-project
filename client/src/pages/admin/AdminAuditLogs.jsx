import React, { useEffect, useState } from "react";
import { api } from "../../services/api";

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/admin/audit-logs")
      .then(({ data }) => setLogs(data.logs || []))
      .catch(() => setError("Could not load audit logs."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="admin-page">
      <h1>Audit Logs</h1>
      <p style={{ color: "#5c6673", marginBottom: "1rem" }}>Most recent 200 administrative actions.</p>
      {error && <div className="error-banner">{error}</div>}
      {loading ? (
        <p>Loading…</p>
      ) : logs.length === 0 ? (
        <p style={{ color: "#5c6673" }}>No actions logged yet.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>When</th><th>Admin</th><th>Action</th><th>Target</th><th>Details</th></tr></thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.created_at).toLocaleString()}</td>
                  <td>{log.admin_name || log.admin_email || "—"}</td>
                  <td>{log.action}</td>
                  <td>{log.target_type} #{log.target_id}</td>
                  <td><small>{log.details || "—"}</small></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}