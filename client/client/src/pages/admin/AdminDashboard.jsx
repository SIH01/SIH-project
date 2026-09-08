import React from "react";
import { useAuth } from "../../context/AuthContext.jsx";

export default function AdminDashboard() {
  const { user } = useAuth();
  return (
    <div style={{ maxWidth: "700px", margin: "3rem auto", padding: "0 2rem" }}>
      <h1 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>Admin Dashboard</h1>
      <p>Signed in as {user?.email} (role: {user?.role}).</p>
      <p style={{ marginTop: "1rem", color: "#5c6673" }}>
        Statistics, disaster management, organization verification, and the
        rest of the admin navigation are built starting in Stage 3.
      </p>
    </div>
  );
}
