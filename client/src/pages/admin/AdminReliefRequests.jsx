import React, { useEffect, useState } from "react";
import { api } from "../../services/api";

export default function AdminReliefRequests() {
  const [requests, setRequests] = useState([]); const [error, setError] = useState("");
  useEffect(() => { api.get("/relief-requests").then(({ data }) => setRequests(data.requests || [])).catch(() => setError("Could not load relief requests.")); }, []);
  async function update(id, status) { try { const { data } = await api.patch(`/relief-requests/${id}`, { status }); setRequests((items) => items.map((item) => item.id === id ? { ...item, status: data.request.status } : item)); } catch { setError("Could not update request status."); } }
  return <div className="admin-page"><h1>Relief Requests</h1>{error && <div className="error-banner">{error}</div>}<div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Requester</th><th>Need</th><th>Disaster / location</th><th>Submitted</th><th>Status</th></tr></thead><tbody>{requests.map((request) => <tr key={request.id}><td>{request.name}<br /><small>{request.contact}</small></td><td>{request.need_type}</td><td>{request.disaster_name || "Related need"}<br /><small>{request.location_name || `${request.latitude}, ${request.longitude}`}</small></td><td>{new Date(request.created_at).toLocaleDateString()}</td><td><select value={request.status} onChange={(e) => update(request.id, e.target.value)}><option value="pending">pending</option><option value="in_progress">in progress</option><option value="resolved">resolved</option></select></td></tr>)}</tbody></table></div></div>;
}
