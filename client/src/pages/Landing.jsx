import { Link } from "react-router-dom";
import "./Landing.css";

export default function Landing() {
  return (
    <div className="ds-landing">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-dot"></span>
            Disaster awareness & relief, in one place
          </div>

          <h1>
            Know the risk.<br />
            Find help.<br />
            <span>Help others.</span>
          </h1>

          <p className="hero-description">
            DisasterShield brings disaster awareness and relief together —
            helping people understand the risks around them and connecting
            affected communities with verified organizations ready to act.
          </p>

          <div className="ctas">
            <Link to="/map" className="btn btn-primary">
              Explore Disaster Map <span>↗</span>
            </Link>
            <Link to="/get-help" className="btn btn-secondary">
              I Need Help <span>→</span>
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-glow"></div>
          <div className="shield-ring"></div>
          <div className="shield"></div>
          <div className="person">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="feature-grid">
          <article className="card card-green">
            <div className="map-lines">
              <span></span><span></span><span></span><span></span>
              <div className="map-dot"></div>
            </div>

            <div className="pill pill-awareness">Disaster Awareness</div>
            <h2>Understand the risks around any location.</h2>
            <p>
              Search a location or drop a pin to explore historical,
              active, and forecasted disasters within a 50 km radius.
            </p>

            <div className="card-actions">
              <Link to="/map" className="btn btn-primary">
                Explore Disaster Map <span>↗</span>
              </Link>
            </div>
          </article>

          <article className="card card-red relief">
            <div className="map-lines">
              <span></span><span></span><span></span><span></span>
              <div className="map-dot"></div>
            </div>

            <div className="pill pill-relief">Disaster Relief</div>
            <h2>Get the right help when it matters most.</h2>
            <p>
              Request food, shelter, medical care, or mental-health
              support and connect with verified organizations near you.
            </p>

            <div className="card-actions">
              <Link to="/get-help" className="btn btn-primary">
                I Need Help <span>→</span>
              </Link>
              <Link to="/organizations/register" className="btn btn-secondary">
                I Want to Help
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="trust">
        <div className="trust-label">
          Built for communities, volunteers & relief organizations
        </div>
        <div className="trust-row">
          <span>LOCAL COMMUNITIES</span>
          <span>VOLUNTEERS</span>
          <span>RELIEF GROUPS</span>
          <span>FIRST RESPONDERS</span>
        </div>
      </section>
    </div>
  );
}