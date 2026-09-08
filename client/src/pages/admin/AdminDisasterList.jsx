import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";

export default function AdminDisasterList() {
  const [disasters, setDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/disasters");
      setDisasters(data.disasters);
    } catch (err) {
      setError("Could not load disasters.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/disasters/${id}`);
      setDisasters((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || "Could not delete disaster.");
    }
  }

  return (
    <div style={{ maxWidth: "1000px", margin: "3rem auto", padding: "0 2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.8rem" }}>Manage Disasters</h1>
        <Link to="/admin/disasters/new" className="btn btn-awareness">+ Add Disaster</Link>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {loading ? (
        <p>Loading…</p>
      ) : disasters.length === 0 ? (
        <p style={{ color: "#5c6673" }}>No disaster records yet. Add the first one above.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--line)", textAlign: "left" }}>
              <th style={{ padding: "0.6rem" }}>Name</th>
              <th style={{ padding: "0.6rem" }}>Type</th>
              <th style={{ padding: "0.6rem" }}>Status</th>
              <th style={{ padding: "0.6rem" }}>Severity</th>
              <th style={{ padding: "0.6rem" }}>Date</th>
              <th style={{ padding: "0.6rem" }}>Location</th>
              <th style={{ padding: "0.6rem" }}></th>
            </tr>
          </thead>
          <tbody>
            {disasters.map((d) => (
              <tr key={d.id} style={{ borderBottom: "1px solid var(--line)" }}>
                <td style={{ padding: "0.6rem", fontWeight: 600 }}>{d.name}</td>
                <td style={{ padding: "0.6rem" }}>{d.type}</td>
                <td style={{ padding: "0.6rem" }}>
                  <span className={`badge ${d.status === "Historical" ? "badge-awareness" : "badge-relief"}`}>
                    {d.status}
                  </span>
                </td>
                <td style={{ padding: "0.6rem" }}>{d.severity}</td>
                <td style={{ padding: "0.6rem" }}>{new Date(d.date).toLocaleDateString()}</td>
                <td style={{ padding: "0.6rem" }}>{d.location_name}</td>
                <td style={{ padding: "0.6rem", display: "flex", gap: "0.5rem" }}>
                  <Link
                    to={`/admin/disasters/${d.id}/edit`}
                    className="btn btn-outline-ink"
                    style={{ padding: "0.35rem 0.8rem", fontSize: "0.85rem" }}
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(d.id, d.name)}
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