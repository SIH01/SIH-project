import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

export default function Organizations() {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/organizations")
      .then(({ data }) => setOrgs(data.organizations))
      .catch(() => setError("Could not load organizations."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: "900px", margin: "3rem auto", padding: "0 2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", marginBottom: "0.5rem" }}>
        <h1 style={{ fontSize: "1.8rem" }}>Verified Organizations</h1>
        <Link to="/organizations/register" className="btn btn-awareness">Register your organization</Link>
      </div>
      <p style={{ color: "#5c6673", marginBottom: "1.75rem" }}>
        Every organization listed here has been reviewed and verified by a DisasterShield admin.
      </p>

      {error && <div className="error-banner">{error}</div>}
      {loading ? (
        <p>Loading…</p>
      ) : orgs.length === 0 ? (
        <p style={{ color: "#5c6673" }}>No verified organizations yet.</p>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {orgs.map((o) => (
            <div key={o.id} style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "6px", padding: "1.25rem 1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                    {o.name} <span className="badge badge-relief" style={{ marginLeft: "0.5rem" }}>✓ Verified</span>
                  </div>
                  <div style={{ color: "#5c6673", fontSize: "0.88rem" }}>{o.type}</div>
                </div>
                {o.website && <a href={o.website.startsWith("http") ? o.website : `https://${o.website}`} target="_blank" rel="noreferrer" style={{ fontSize: "0.88rem" }}>Website →</a>}
              </div>
              {o.description && <p style={{ margin: "0.75rem 0" }}>{o.description}</p>}
              {o.operating_areas && <div style={{ fontSize: "0.85rem", color: "#5c6673" }}>Operates in: {o.operating_areas}</div>}
              {o.assistance_categories?.length > 0 && (
                <div style={{ marginTop: "0.6rem", display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {o.assistance_categories.map((c) => (
                    <span key={c} className="badge badge-awareness">{c}</span>
                  ))}
                </div>
              )}
              <div style={{ marginTop: "1rem", display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                <Link to={`/organizations/${o.id}/contact`} className="btn btn-relief">Contact Organization</Link>
                <Link to={`/organizations/${o.id}`} className="btn btn-outline-ink">View profile</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
