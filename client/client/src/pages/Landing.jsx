import React from "react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div>
      <section style={{ background: "var(--ink)", color: "var(--paper)", padding: "5rem 2rem 4rem" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto", textAlign: "left" }}>
          <h1 style={{ fontSize: "2.6rem", marginBottom: "1rem" }}>
            Know the risk. Find help. Help others.
          </h1>
          <p style={{ color: "rgba(245,242,236,0.82)", fontSize: "1.1rem" }}>
            DisasterShield combines disaster awareness with disaster relief,
            helping people understand risks around their destination and
            connecting affected communities with verified organizations.
          </p>
        </div>
      </section>

      <section style={{ maxWidth: "1000px", margin: "0 auto", padding: "3rem 2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "8px", padding: "2rem" }}>
            <span className="badge badge-awareness" style={{ marginBottom: "0.75rem" }}>🌍 DISASTER AWARENESS</span>
            <h2 style={{ fontSize: "1.4rem", margin: "0.5rem 0 0.75rem" }}>Explore disasters around any location.</h2>
            <p style={{ marginBottom: "1.5rem" }}>
              Search or drop a pin and see recorded disasters within 50 km —
              historical, current, or forecast, each clearly labeled.
            </p>
            <Link to="/map" className="btn btn-awareness">Explore Disaster Map</Link>
          </div>

          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "8px", padding: "2rem" }}>
            <span className="badge badge-relief" style={{ marginBottom: "0.75rem" }}>🆘 DISASTER RELIEF</span>
            <h2 style={{ fontSize: "1.4rem", margin: "0.5rem 0 0.75rem" }}>Connect affected people with organizations that can help.</h2>
            <p style={{ marginBottom: "1.5rem" }}>
              Request food, shelter, medical, or mental-health support — and
              get matched with verified organizations near you.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <Link to="/get-help" className="btn btn-relief">I Need Help</Link>
              <Link to="/get-help" className="btn btn-outline-ink">I Want to Help</Link>
              <Link to="/organizations" className="btn btn-outline-ink">Register Organization</Link>
            </div>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: "700px", margin: "0 auto", padding: "1rem 2rem 3.5rem", textAlign: "center" }}>
        <p style={{ color: "#5c6673" }}>New here?</p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/register" className="btn btn-outline-ink">Register</Link>
          <Link to="/login" className="btn btn-outline-ink">Login</Link>
          <Link to="/admin/login" className="btn btn-outline-ink">Admin Login</Link>
        </div>
      </section>
    </div>
  );
}
