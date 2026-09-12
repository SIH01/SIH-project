import React from "react";
import { Link } from "react-router-dom";

export default function OrganizationAuthLayout({ children }) {
  return (
    <main className="organization-auth-shell">
      <Link to="/" className="organization-auth-brand">
        <span className="organization-auth-mark">✓</span>
        <span>DisasterShield<small>Organization portal</small></span>
      </Link>
      {children}
    </main>
  );
}
