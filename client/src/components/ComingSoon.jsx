import React from "react";

export default function ComingSoon({ title, stageNote }) {
  return (
    <div style={{ maxWidth: "600px", margin: "4rem auto", padding: "0 2rem", textAlign: "center" }}>
      <h1 style={{ fontSize: "1.8rem", marginBottom: "0.75rem" }}>{title}</h1>
      <p style={{ color: "#5c6673" }}>{stageNote}</p>
    </div>
  );
}
