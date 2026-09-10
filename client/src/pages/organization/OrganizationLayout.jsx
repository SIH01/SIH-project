import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../services/api";
import "../../pages/contactPortal.css";
import "./OrganizationConsole.css";

const links = [
  ["/organization/dashboard", "Overview", "▦"],
  ["/organization/requests", "Response queue", "↗"],
  ["/organization/missing-persons", "Case management", "⌕"],
  ["/organization/campaigns", "Campaign review", "◆"],
  ["/organization/profile", "Organization profile", "◉"],
];

export default function OrganizationLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [organization, setOrganization] = useState(null);

  useEffect(() => {
    api.get("/organizations/me").then(({ data }) => setOrganization(data.organization)).catch(() => {});
  }, []);

  function signOut() {
    logout();
    navigate("/organization/login");
  }

  const verified = organization?.verification_status === "Verified";

  return (
    <main className="org-console">
      <aside className="org-console-sidebar">
        <NavLink to="/organization/dashboard" className="org-console-brand">
          <span className="nav-brand-mark" aria-hidden="true">✓</span>
          <span>DisasterShield<small>RESPONSE CONSOLE</small></span>
        </NavLink>
        <div className="org-console-context">
          <span className={`org-status-dot ${verified ? "is-verified" : ""}`} />
          <div><strong>{organization?.name || user?.name || "Organization"}</strong><small>{verified ? "Verified partner" : "Pending review"}</small></div>
        </div>
        <nav className="org-console-nav" aria-label="Organization portal">
          {links.map(([to, label, icon]) => (
            <NavLink key={to} to={to} className={({ isActive }) => isActive ? "active" : ""}>
              <span aria-hidden="true">{icon}</span>{label}
            </NavLink>
          ))}
        </nav>
        <div className="org-console-footer">
          <button type="button" onClick={() => navigate("/organizations")}>Public directory</button>
          <button type="button" onClick={signOut}>Sign out</button>
        </div>
      </aside>
      <section className="org-console-content"><Outlet /></section>
    </main>
  );
}
