import React, { useEffect, useState } from "react";
import { api } from "../../services/api";

export default function AdminOrganizations() {
  const [pending, setPending] = useState([]);
  const [all, setAll] = useState([]);
  const [view, setView] = useState("pending"); // "pending" | "all"
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  async function loadPending() {
    try {
      const { data } = await api.get("/organizations/pending");
      setPending(data.organizations || []);
    } catch {
      setError("Could not load pending organizations.");
    }
  }

  async function loadAll() {
    try {
      const { data } = await api.get("/organizations/admin/all");
      setAll(data.organizations || []);
    } catch {
      setError("Could not load organizations.");
    }
  }

  useEffect(() => { loadPending(); loadAll(); }, []);

  async function verify(id, status) {
    try {
      await api.patch(`/organizations/${id}/verify`, { status });
      setPending((items) => items.filter((item) => item.id !== id));
      loadAll();
    } catch {
      setError("Could not update organization.");
    }
  }

  async function deleteOrg(org) {
    const confirmed = window.confirm(
      `Delete "${org.name}"? This permanently removes the organization, its login, its shelters, and its campaigns. This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(org.id);
    setError("");
    try {
      await api.delete(`/organizations/${org.id}`);
      setAll((items) => items.filter((item) => item.id !== org.id));
      setPending((items) => items.filter((item) => item.id !== org.id));
    } catch {
      setError(`Could not delete "${org.name}".`);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-heading-row">
        <div>
          <h1>Organizations</h1>
          <p className="dashboard-muted">Review new registrations, or manage every organization on the platform.</p>
        </div>
        <div className="admin-filter-row">
          <button
            className={`btn compact-button ${view === "pending" ? "btn-awareness" : "btn-relief"}`}
            onClick={() => setView("pending")}
          >
            Pending review ({pending.length})
          </button>
          <button
            className={`btn compact-button ${view === "all" ? "btn-awareness" : "btn-relief"}`}
            onClick={() => setView("all")}
          >
            All organizations ({all.length})
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {view === "pending" ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Organization</th><th>Contact</th><th>Registered</th><th>Details</th><th>Review</th></tr>
            </thead>
            <tbody>
              {pending.map((org) => (
                <tr key={org.id}>
                  <td><strong>{org.name}</strong><br /><small>{org.type}</small></td>
                  <td>{org.email}<br />{org.phone}</td>
                  <td>{new Date(org.created_at).toLocaleDateString()}</td>
                  <td>{org.documents || org.description || "No additional details"}</td>
                  <td>
                    <button className="btn btn-awareness compact-button" onClick={() => verify(org.id, "approved")}>Approve</button>
                    <button className="btn btn-relief compact-button" onClick={() => verify(org.id, "rejected")}>Reject</button>
                  </td>
                </tr>
              ))}
              {pending.length === 0 && (
                <tr><td colSpan={5}><small>No organizations awaiting review.</small></td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Organization</th><th>Contact</th><th>Status</th><th>Registered</th><th>Manage</th></tr>
            </thead>
            <tbody>
              {all.map((org) => (
                <tr key={org.id}>
                  <td><strong>{org.name}</strong><br /><small>{org.type}</small></td>
                  <td>{org.email}<br />{org.phone}</td>
                  <td>{org.verification_status}</td>
                  <td>{new Date(org.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-relief compact-button"
                      disabled={deletingId === org.id}
                      onClick={() => deleteOrg(org)}
                    >
                      {deletingId === org.id ? "Deleting…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
              {all.length === 0 && (
                <tr><td colSpan={5}><small>No organizations yet.</small></td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
