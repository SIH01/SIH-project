import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../services/api";
import "./contactPortal.css";

const editable = ["name", "description", "website", "email", "phone", "address", "operating_areas", "representative_name", "representative_contact"];

export default function OrganizationProfile() {
  const { id } = useParams();
  const [organization, setOrganization] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  useEffect(() => {
    api.get(id ? `/organizations/${id}` : "/organizations/me")
      .then(({ data }) => { setOrganization(data.organization); setForm(data.organization); })
      .catch((err) => setError(err.response?.data?.error || "This organization could not be found."));
  }, [id]);

  if (error) return <main className={id ? "contact-page" : "org-page"}><div className="error-banner">{error}</div></main>;
  if (!organization) return <main className={id ? "contact-page" : "org-page"}><p>Loading organization profile…</p></main>;
  if (id) return <main className="contact-page"><Link to="/organizations" className="back-link">← Verified organizations</Link><section className="confirmation-panel" style={{ marginTop: "1.5rem" }}><span className="badge badge-relief">✓ Verified by DisasterShield</span><p className="eyebrow" style={{ marginTop: "1.25rem" }}>{organization.type}</p><h1>{organization.name}</h1><p>{organization.description || "A verified organization coordinating practical support for affected communities."}</p><div className="profile-facts"><strong>Operating areas</strong><span>{organization.operating_areas || "Regional response"}</span><strong>Contact</strong><span>{organization.email || organization.phone || "Contact through DisasterShield"}</span></div><div className="tag-row">{organization.assistance_categories?.map((category) => <span className="badge badge-awareness" key={category}>{category}</span>)}</div><Link className="btn btn-relief" to={`/organizations/${id}/contact`} style={{ marginTop: "1.5rem" }}>Contact Organization</Link></section></main>;

  async function save(event) {
    event.preventDefault(); setError(""); setSaved("");
    try {
      const { data } = await api.patch("/organizations/me", Object.fromEntries(editable.map((key) => [key, form[key] || ""])));
      setOrganization(data.organization); setForm(data.organization); setSaved("Profile saved. Changes requiring verification are marked pending review.");
    } catch (err) { setError(err.response?.data?.error || "Could not save organization profile."); }
  }

  return <div className="org-page"><header className="org-page-header"><div><p className="eyebrow">Organization profile</p><h1>Keep your response details current</h1><p>Admins review changes to public-facing details before they are published.</p></div><span className="org-header-chip">{organization.verification_status}</span></header>{error && <div className="error-banner">{error}</div>}{saved && <div className="modal-message">{saved}</div>}<form className="org-panel" style={{ padding: "1.5rem" }} onSubmit={save}><div className="form-grid">{editable.map((key) => <label className="field" key={key}><span>{key.replaceAll("_", " ")}</span>{key === "description" || key === "operating_areas" ? <textarea rows={key === "description" ? 4 : 2} value={form[key] || ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /> : <input value={form[key] || ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />}</label>)}</div><div style={{ marginTop: "1.25rem" }}><button className="btn btn-awareness" type="submit">Save profile changes</button></div></form></div>;
}
