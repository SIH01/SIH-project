import React from "react";

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: "1.75rem" }}>
      <h2 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>{title}</h2>
      <p>{children}</p>
    </div>
  );
}

export default function About() {
  return (
    <div style={{ maxWidth: "700px", margin: "3rem auto", padding: "0 2rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>What is DisasterShield?</h1>

      <Section title="What is DisasterShield?">
        DisasterShield combines disaster awareness with disaster relief:
        it helps people understand risks around a destination, and connects
        people affected by disasters with verified organizations that can help.
      </Section>

      <Section title="How the Disaster Awareness system works">
        Select a location on the map and DisasterShield looks at recorded
        disasters within a 50 km radius, drawn from the administrator-entered
        disaster database.
      </Section>

      <Section title="How the 50 km search works">
        The straight-line (great-circle) distance between your selected point
        and each disaster's coordinates is calculated with the Haversine
        formula. Only records within 50 km are shown, along with the exact
        distance.
      </Section>

      <Section title="How disaster records are sourced">
        Records are entered and reviewed by administrators, each with a
        source/reference. Later stages will add clearly labeled external data
        (weather, earthquake feeds, government alerts) alongside — never
        mixed in as if it were the same thing.
      </Section>

      <Section title="How the Relief system works">
        Affected people can request food, shelter, medical, or mental-health
        support. Verified organizations operating within range are matched to
        the request and can respond.
      </Section>

      <Section title="How organizations are verified">
        Organizations register with their details and supporting documents.
        An administrator reviews the application before the organization can
        respond to any request or appear with a Verified badge.
      </Section>

      <Section title="How fundraising verification works">
        Only verified organizations can create fundraising campaigns, and
        every campaign is reviewed by an administrator before it becomes
        publicly visible.
      </Section>

      <div className="error-banner" style={{ marginTop: "1rem", background: "rgba(16,27,45,0.05)", borderColor: "var(--line)", color: "var(--ink-on-paper)" }}>
        DisasterShield is an awareness and coordination platform. It does not
        replace official emergency alerts, government advisories, emergency
        services, medical professionals, or disaster-management authorities.
      </div>
    </div>
  );
}
