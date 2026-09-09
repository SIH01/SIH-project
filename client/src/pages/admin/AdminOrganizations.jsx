import React, { useEffect, useState } from "react";
import { api } from "../../services/api";

export default function AdminOrganizations() {
  const [organizations, setOrganizations] = useState([]); const [error, setError] = useState("");
  async function load() { try { const { data } = await api.get("/organizations/pending"); setOrganizations(data.organizations || []); } catch { setError("Could not load pending organizations."); } }
  useEffect(() => { load(); }, []);
  async function verify(id, status) { try { await api.patch(`/organizations/${id}/verify`, { status }); setOrganizations((items) => items.filter((item) => item.id !== id)); } catch { setError("Could not update organization."); } }
  return <div className="admin-page"><h1>Organization Verification</h1>{error && <div className="error-banner">{error}</div>}<div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Organization</th><th>Contact</th><th>Registered</th><th>Details</th><th>Review</th></tr></thead><tbody>{organizations.map((org) => <tr key={org.id}><td><strong>{org.name}</strong><br /><small>{org.type}</small></td><td>{org.email}<br />{org.phone}</td><td>{new Date(org.created_at).toLocaleDateString()}</td><td>{org.documents || org.description || "No additional details"}</td><td><button className="btn btn-awareness compact-button" onClick={() => verify(org.id, "approved")}>Approve</button><button className="btn btn-relief compact-button" onClick={() => verify(org.id, "rejected")}>Reject</button></td></tr>)}</tbody></table></div></div>;
}
