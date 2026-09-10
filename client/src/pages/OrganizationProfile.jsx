import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../services/api";
import "./contactPortal.css";

export default function OrganizationProfile() {
  const { id } = useParams();
  const [organization, setOrganization] = useState(null); const [error, setError] = useState("");
  useEffect(() => { api.get(`/organizations/${id}`).then(({ data }) => setOrganization(data.organization)).catch(() => setError("This organization could not be found.")); }, [id]);
  if (error) return <main className="contact-page"><div className="error-banner">{error}</div></main>;
  if (!organization) return <main className="contact-page"><p>Loading organization profile…</p></main>;
  return <main className="contact-page"><Link to="/organizations" className="back-link">← Verified organizations</Link><section className="confirmation-panel" style={{ marginTop: "1.5rem" }}><span className="badge badge-relief">✓ Verified by DisasterShield</span><p className="eyebrow" style={{ marginTop: "1.25rem" }}>{organization.type}</p><h1>{organization.name}</h1><p>{organization.description || "A verified organization coordinating practical support for affected communities."}</p><div className="profile-facts"><strong>Operating areas</strong><span>{organization.operating_areas || "Regional response"}</span><strong>Contact</strong><span>{organization.email || organization.phone || "Contact through DisasterShield"}</span></div><div className="tag-row">{organization.assistance_categories?.map((category) => <span className="badge badge-awareness" key={category}>{category}</span>)}</div><Link className="btn btn-relief" to={`/organizations/${id}/contact`} style={{ marginTop: "1.5rem" }}>Contact Organization</Link></section></main>;
}
