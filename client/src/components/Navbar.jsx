import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const navStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "1.1rem 2rem",
  background: "var(--ink)",
  color: "var(--paper)",
  flexWrap: "wrap",
  gap: "0.75rem",
};
const linkGroupStyle = { display: "flex", gap: "1.4rem", alignItems: "center", flexWrap: "wrap" };
const linkStyle = { color: "var(--paper)", textDecoration: "none", fontSize: "0.92rem" };
const brandStyle = {
  fontFamily: "var(--font-display)",
  fontSize: "1.2rem",
  color: "var(--paper)",
  textDecoration: "none",
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav style={navStyle}>
      <Link to="/" style={brandStyle}>
        🛡️ DisasterShield
      </Link>
      <div style={linkGroupStyle}>
        <Link to="/" style={linkStyle}>Home</Link>
        <Link to="/map" style={linkStyle}>Disaster Map</Link>
        <Link to="/get-help" style={linkStyle}>Get Help</Link>
        <Link to="/organizations" style={linkStyle}>Organizations</Link>
        <Link to="/about" style={linkStyle}>About</Link>

        {!user && (
          <Link to="/login" className="btn btn-outline" style={{ padding: "0.4rem 0.9rem" }}>
            Login
          </Link>
        )}

        {user && user.role === "user" && (
          <>
            <span style={{ ...linkStyle, opacity: 0.75 }}>Hi, {user.name}</span>
            <button onClick={handleLogout} className="btn btn-outline">Logout</button>
          </>
        )}

        {user && user.role === "admin" && (
          <>
            <Link to="/admin/dashboard" style={linkStyle}>Admin Dashboard</Link>
            <Link to="/admin/disasters" style={linkStyle}>Disasters</Link>
            <Link to="/admin/disasters/new" style={linkStyle}>Add Disaster</Link>
            <Link to="/admin/assistance" style={linkStyle}>Assistance Requests</Link>
            <button onClick={handleLogout} className="btn btn-outline">Logout</button>
          </>
        )}

        {user && user.role === "organization" && (
          <>
            <Link to="/organization/dashboard" style={linkStyle}>Org Dashboard</Link>
            <button onClick={handleLogout} className="btn btn-outline">Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}
