import React from "react";

function computeRiskScore(historicalCount, highSevereCount) {
  return Math.min(100, historicalCount * 5 + highSevereCount * 10);
}

function mostCommonType(disasters) {
  if (disasters.length === 0) return "—";
  const counts = {};
  disasters.forEach((d) => {
    counts[d.type] = (counts[d.type] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

function riskLabel(score) {
  if (score >= 65) return "High risk";
  if (score >= 35) return "Moderate risk";
  return "Low risk";
}

// Note: this summary is always computed from the FULL nearby list (not the
// filtered/sorted one shown in the results panel) — it describes the fixed
// 50km radius, independent of whatever the user is currently filtering by.
export default function RiskSummary({ locationName, radiusKm, disasters }) {
  const historicalCount = disasters.filter((d) => d.status === "Historical").length;
  const highSevereCount = disasters.filter((d) => d.severity === "High" || d.severity === "Severe").length;
  const commonType = mostCommonType(disasters);
  const riskScore = computeRiskScore(historicalCount, highSevereCount);
  const riskColor = riskScore >= 65 ? "var(--relief)" : riskScore >= 35 ? "var(--warn)" : "var(--awareness)";

  function severityClass(severity) {
    if (severity === "High" || severity === "Severe") return "risk-severity risk-severity-high";
    if (severity === "Moderate") return "risk-severity risk-severity-medium";
    return "risk-severity risk-severity-low";
  }

  return (
    <div className="risk-summary">
      <div style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: "0.75rem" }}>Risk Summary</div>

      <div style={{ fontSize: "0.9rem", lineHeight: 1.8 }}>
        <div><strong>Location:</strong> {locationName}</div>
        <div><strong>Radius:</strong> {radiusKm} km</div>
        <div><strong>Historical events found:</strong> {historicalCount}</div>
        <div><strong>High/Severe events:</strong> {highSevereCount}</div>
        <div><strong>Most common disaster:</strong> {commonType}</div>
      </div>

      <div style={{ marginTop: "0.8rem" }}>
        <div style={{ fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.35rem" }}>Nearby severity</div>
        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
          {["Low", "Moderate", "High", "Severe"].map((severity) => (
            <span key={severity} className={severityClass(severity)}>
              {severity}: {disasters.filter((d) => d.severity === severity).length}
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "0.9rem" }}>
        <div className="risk-score-block">
          <div
            className="risk-gauge"
            style={{ background: `conic-gradient(${riskColor} ${riskScore * 3.6}deg, rgba(16,27,45,0.08) 0deg)` }}
            aria-label={`Risk Score: ${riskScore} out of 100`}
          >
            <div className="risk-gauge-inner">
              <strong>{riskScore}</strong>
              <span>/100</span>
            </div>
          </div>
          <div>
            <div className="risk-score-title">Risk Score</div>
            <div className="risk-score-label" style={{ color: riskColor }}>{riskLabel(riskScore)}</div>
            <div className="risk-score-note">Based on nearby event history and severity.</div>
          </div>
        </div>
      </div>
    </div>
  );
}