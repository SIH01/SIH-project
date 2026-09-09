import React, { useEffect, useState } from "react";
import { api } from "../../services/api";

export default function AdminShelters() {
  const [shelters, setShelters] = useState([]); const [error, setError] = useState(""); const [note, setNote] = useState({});
  async function load() { try { const { data } = await api.get("/shelters/all"); setShelters(data.shelters || []); } catch { setError("Could not load shelters."); } }
  useEffect(() => { load(); }, []);
  async function review(id, approvalStatus) { try { const { data } = await api.patch(`/shelters/${id}/review`, { approvalStatus, reviewNote: note[id] }); setShelters((items) => items.map((item) => item.id === id ? data.shelter : item)); } catch { setError("Could not review shelter."); } }
  const pending = shelters.filter((shelter) => shelter.approval_status === "pending"); const reviewed = shelters.filter((shelter) => shelter.approval_status !== "pending");
  const card = (shelter) => <div className="admin-list-item" key={shelter.id}><div><strong>{shelter.name}</strong><div className="dashboard-muted">Submitted by {shelter.organization_name} · {shelter.latitude}, {shelter.longitude}</div><div>{shelter.current_occupancy}/{shelter.capacity} occupied · {shelter.facilities?.join(", ") || "No facilities"}</div><small>{shelter.contact || "No contact"}</small></div><div><span className={`status-pill status-${shelter.approval_status}`}>{shelter.approval_status}</span>{shelter.approval_status === "pending" && <><input className="review-note" placeholder="Optional review note" value={note[shelter.id] || ""} onChange={(e) => setNote({ ...note, [shelter.id]: e.target.value })} /><button className="btn btn-awareness compact-button" onClick={() => review(shelter.id, "approved")}>Approve</button><button className="btn btn-relief compact-button" onClick={() => review(shelter.id, "rejected")}>Reject</button></>}</div></div>;
  return <div className="admin-page"><h1>Shelter Review</h1>{error && <div className="error-banner">{error}</div>}<h2>Pending review</h2>{pending.length ? pending.map(card) : <p className="dashboard-muted">No shelters awaiting review.</p>}<h2>Review history</h2>{reviewed.map(card)}</div>;
}
