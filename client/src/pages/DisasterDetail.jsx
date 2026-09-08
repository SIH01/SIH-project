import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { api } from "../services/api";

export default function DisasterDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  const [disaster, setDisaster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get(`/disasters/${id}`, { params: lat && lng ? { lat, lng } : {} })
      .then(({ data }) => setDisaster(data.disaster))
      .catch(() => setError("Could not load this disaster record."))
      .finally(() => setLoading(false));
  }, [id, lat, lng]);

  if (loading) return <p style={{ padding: "2rem" }}>Loading…</p>;
  if (error) return <div className="error-banner" style={{ margin: "2rem" }}>{error}</div>;
  if (!disaster) return null;

  const isLiveInfo = disaster.status === "Current" || disaster.status === "Forecast";

  return (
    <div style={{ maxWidth: "760px", margin: "3rem auto", padding: "0 2rem" }}>
      <Link to="/map" className="btn btn-outline-ink" style={{ marginBottom: "1.5rem", display: "inline-flex" }}>
        ← Back to Map
      </Link>

      <div style={{ display: "flex", gap: "0.6rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
        <span className="badge badge-awareness">{disaster.type}</span>
        <span className={`badge ${disaster.status === "Historical" ? "badge-awareness" : "badge-relief"}`}>
          {disaster.status}
        </span>
        <span className="badge badge-relief">{disaster.severity} severity</span>
      </div>

      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{disaster.name}</h1>
      <p style={{ color: "#5c6673", marginBottom: "1.5rem" }}>
        {disaster.location_name} · {new Date(disaster.date).toLocaleDateString()}
        {typeof disaster.distance_km === "number" && ` · ${disaster.distance_km} km from your selected location`}
      </p>

      {isLiveInfo && (
        <div className="error-banner" style={{ marginBottom: "1.5rem" }}>
          This is {disaster.status.toLowerCase()} information, not a historical record. It does not
          replace official government alerts, emergency services, or disaster-management authorities —
          always follow guidance from local authorities.
        </div>
      )}

      {disaster.description && (
        <section style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.4rem" }}>Description</h3>
          <p>{disaster.description}</p>
        </section>
      )}

      {disaster.affected_area && (
        <section style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.4rem" }}>Affected Area</h3>
          <p>{disaster.affected_area}</p>
        </section>
      )}

      {disaster.safety_information && (
        <section style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.4rem" }}>Safety Information</h3>
          <p>{disaster.safety_information}</p>
        </section>
      )}

      <section style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ fontSize: "1.1rem", marginBottom: "0.4rem" }}>Source</h3>
        <p style={{ color: "#5c6673" }}>{disaster.source || "Not specified"}</p>
      </section>

      <p style={{ fontSize: "0.85rem", color: "#8892a0" }}>
        Relief requests tied to this disaster (Get Help, missing persons, shelter, and organization
        responses) are added starting in Stage 5.
      </p>
    </div>
  );
}