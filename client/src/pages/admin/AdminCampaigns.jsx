import React, { useEffect, useState } from "react";
import { api } from "../../services/api";

export default function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/campaigns/admin/all");
      setCampaigns(data.campaigns || []);
    } catch (err) {
      setError("Could not load campaigns.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function updateVerification(id, verification_status) {
    try {
      const { data } = await api.put(`/campaigns/${id}/verify`, { verification_status });
      setCampaigns((prev) => prev.map((c) => (c.id === id ? data.campaign : c)));
    } catch (err) {
      alert(err.response?.data?.error || "Could not update campaign.");
    }
  }

  async function updateLifecycle(id, status) {
    try {
      const { data } = await api.put(`/campaigns/${id}/verify`, { status });
      setCampaigns((prev) => prev.map((c) => (c.id === id ? data.campaign : c)));
    } catch (err) {
      alert(err.response?.data?.error || "Could not update campaign.");
    }
  }

  return (
    <div className="admin-page">
      <h1>Campaign Verification</h1>
      {error && <div className="error-banner">{error}</div>}
      {loading ? (
        <p>Loading…</p>
      ) : campaigns.length === 0 ? (
        <p style={{ color: "#5c6673" }}>No campaigns submitted yet.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Campaign</th><th>Target / Raised</th><th>Verification</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.title}</strong><br /><small>{c.location_name}</small></td>
                  <td>₹{Number(c.amount_raised).toLocaleString("en-IN")} / ₹{Number(c.target_amount).toLocaleString("en-IN")}</td>
                  <td><span className="badge badge-awareness">{c.verification_status}</span></td>
                  <td><span className="badge badge-relief">{c.status}</span></td>
                  <td style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                    {c.verification_status === "Pending Verification" && (
                      <>
                        <button className="btn btn-awareness compact-button" onClick={() => updateVerification(c.id, "Verified")}>Approve</button>
                        <button className="btn btn-relief compact-button" onClick={() => updateVerification(c.id, "Rejected")}>Reject</button>
                      </>
                    )}
                    {c.status === "Active" && (
                      <>
                        <button className="btn btn-outline-ink compact-button" onClick={() => updateLifecycle(c.id, "Completed")}>Mark Completed</button>
                        <button className="btn btn-outline-ink compact-button" onClick={() => updateLifecycle(c.id, "Suspended")}>Suspend</button>
                      </>
                    )}
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