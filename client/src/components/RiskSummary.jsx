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

// Note: this summary is always computed from the FULL nearby list (not the
// filtered/sorted one shown in the results panel) — it describes the fixed
// 50km radius, independent of whatever the user is currently filtering by.
export default function RiskSummary({ locationName, radiusKm, disasters }) {
  const historicalCount = disasters.filter((d) => d.status === "Historical").length;
  const highSevereCount = disasters.filter((d) => d.severity === "High" || d.severity === "Severe").length;
  const commonType = mostCommonType(disasters);
  const riskScore = computeRiskScore(historicalCount, highSevereCount);

  return (
    <div
      style={{
        padding: "1.25rem 1.5rem",
        background: "#fff",
        border: "1px solid var(--line)",
        borderRadius: "6px",
        flex: 1,
        minWidth: "260px",
      }}
    >
      <div style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: "0.75rem" }}>Risk Summary</div>

      <div style={{ fontSize: "0.9rem", lineHeight: 1.8 }}>
        <div><strong>Location:</strong> {locationName}</div>
        <div><strong>Radius:</strong> {radiusKm} km</div>
        <div><strong>Historical events found:</strong> {historicalCount}</div>
        <div><strong>High/Severe events:</strong> {highSevereCount}</div>
        <div><strong>Most common disaster:</strong> {commonType}</div>
      </div>

      <div style={{ marginTop: "0.9rem" }}>
        <div style={{ height: "8px", borderRadius: "999px", background: "rgba(16,27,45,0.08)", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${riskScore}%`,
              background: riskScore > 60 ? "var(--relief)" : riskScore > 30 ? "var(--warn)" : "var(--awareness)",
              transition: "width 0.3s ease",
            }}
          />
        </div>
        <div style={{ fontSize: "0.75rem", color: "#5c6673", marginTop: "0.4rem" }}>
          Prototype risk indicator based on available disaster records.
        </div>
      </div>
    </div>
  );
}