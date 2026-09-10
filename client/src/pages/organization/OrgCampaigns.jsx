import React, { useEffect, useState } from "react";
import { api } from "../../services/api";

const EMPTY_FORM = { title: "", description: "", target_amount: "", purpose: "", location_name: "" };
const textareaStyle = { padding: "0.65rem 0.8rem", border: "1px solid var(--line)", borderRadius: "4px", fontFamily: "var(--font-body)", fontSize: "1rem", width: "100%" };

export default function OrgCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [amountInputs, setAmountInputs] = useState({});

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/campaigns/mine");
      setCampaigns(data.campaigns || []);
    } catch (err) {
      setError(err.response?.data?.error || "Could not load your campaigns.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function set(key, value) { setForm((prev) => ({ ...prev, [key]: value })); }

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setCreating(true);
    try {
      await api.post("/campaigns", form);
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Could not create campaign.");
    } finally {
      setCreating(false);
    }
  }

  async function logAmount(id) {
    const amount = parseFloat(amountInputs[id]);
    if (!amount || amount <= 0) return;
    try {
      const { data } = await api.put(`/campaigns/${id}/amount`, { amount });
      setCampaigns((prev) => prev.map((c) => (c.id === id ? data.campaign : c)));
      setAmountInputs((prev) => ({ ...prev, [id]: "" }));
    } catch (err) {
      alert(err.response?.data?.error || "Could not log amount.");
    }
  }

  return (
    <div className="dashboard-shell">
      <div className="dashboard-card">
        <h1>Create a Fundraising Campaign</h1>
        <p style={{ color: "#5c6673" }}>
          Your organization must be Verified before a campaign can go public — an admin will review this
          before it appears on the public Fundraising page.
        </p>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleCreate}>
          <div className="field">
            <label>Campaign Title</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} required />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} required style={textareaStyle} />
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <div className="field" style={{ flex: 1 }}>
              <label>Target Amount (₹)</label>
              <input type="number" min="1" value={form.target_amount} onChange={(e) => set("target_amount", e.target.value)} required />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <label>Purpose</label>
              <input value={form.purpose} onChange={(e) => set("purpose", e.target.value)} placeholder="e.g. Emergency food kits" />
            </div>
          </div>
          <div className="field">
            <label>Location</label>
            <input value={form.location_name} onChange={(e) => set("location_name", e.target.value)} placeholder="e.g. Silchar, Assam" />
          </div>
          <button className="btn btn-awareness" type="submit" disabled={creating}>{creating ? "Creating…" : "Create Campaign"}</button>
        </form>
      </div>

      <div className="dashboard-card">
        <h2>Your Campaigns</h2>
        {loading ? (
          <p>Loading…</p>
        ) : campaigns.length === 0 ? (
          <p style={{ color: "#5c6673" }}>No campaigns yet.</p>
        ) : (
          campaigns.map((c) => {
            const pct = Math.min(100, Math.round((c.amount_raised / c.target_amount) * 100));
            return (
              <div key={c.id} style={{ padding: "1rem 0", borderBottom: "1px solid var(--line)" }}>
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.4rem" }}>
                  <span className="badge badge-awareness">{c.verification_status}</span>
                  <span className="badge badge-relief">{c.status}</span>
                </div>
                <strong>{c.title}</strong>
                <div style={{ fontSize: "0.85rem", color: "#5c6673", margin: "0.3rem 0" }}>
                  ₹{Number(c.amount_raised).toLocaleString("en-IN")} / ₹{Number(c.target_amount).toLocaleString("en-IN")} ({pct}%)
                </div>
                {c.status === "Active" && (
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      type="number" min="1" placeholder="Amount received"
                      value={amountInputs[c.id] || ""}
                      onChange={(e) => setAmountInputs((prev) => ({ ...prev, [c.id]: e.target.value }))}
                      style={{ padding: "0.4rem 0.6rem", border: "1px solid var(--line)", borderRadius: "4px", width: "160px" }}
                    />
                    <button className="btn btn-outline-ink compact-button" onClick={() => logAmount(c.id)}>Log Funds Received</button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}