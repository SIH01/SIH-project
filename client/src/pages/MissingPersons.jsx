import React, { useEffect, useState } from "react";
import { api } from "../services/api";

function formatDate(value) {
  if (!value) return "Date not provided";
  return new Date(value).toLocaleDateString();
}

export default function MissingPersons() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/missing-persons/public")
      .then(({ data }) => setReports(data.reports || []))
      .catch(() => setError("Could not load missing people."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="directory-page missing-people-page">
      <div className="directory-heading"><div><p className="eyebrow">Community safety</p><h1>Missing People</h1></div></div>
      <p className="directory-intro">
        View current missing-person reports. If you have information that may help, contact the relevant local authorities.
      </p>
      {error && <div className="error-banner">{error}</div>}
      {loading ? (
        <p>Loading…</p>
      ) : reports.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon" aria-hidden="true">⌕</div>
          <h2>No active reports</h2>
          <p>There are no publicly listed missing-person reports right now.</p>
        </div>
      ) : (
        <div className="missing-people-list">
          {reports.map((report) => (
            <article key={report.id} className="missing-person-card">
              <div className="missing-person-photo-wrap">
                {report.photo_url ? <img className="missing-person-photo" src={report.photo_url} alt={`Photo of ${report.person_name}`} /> : <div className="missing-person-photo missing-person-photo-placeholder" aria-hidden="true">⌕</div>}
              </div>
              <div className="missing-person-content">
                <div className="missing-person-card-heading"><div><p className="eyebrow">Missing person</p><h2>{report.person_name}</h2></div><span className={`badge missing-status missing-status-${report.status?.toLowerCase().replace(/\s+/g, "-")}`}>{report.status}</span></div>
                <div className="missing-person-facts">
                  {report.age != null && <span><small>Age</small><strong>{report.age}</strong></span>}
                  <span><small>Last seen</small><strong>{formatDate(report.date_last_seen)}</strong></span>
                  <span><small>Location</small><strong>{report.last_known_location}</strong></span>
                </div>
                {report.description && <p className="missing-person-description">{report.description}</p>}
                {report.additional_information && <p className="missing-person-additional">{report.additional_information}</p>}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}