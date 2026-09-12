import React from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import NotificationBell from "./NotificationBell.jsx";
import "../pages/contactPortal.css";

export default function OrgDashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const linkClass = ({ isActive }) => `org-shell-link${isActive ? " active" : ""}`;

  function handleLogout() {
    logout();
    navigate("/org/login");
  }

  return (
    <main className="org-dashboard-shell">
      <aside className="org-dashboard-sidebar">
        <Link to="/organization/dashboard" className="org-dashboard-brand">
          <span className="org-dashboard-mark">✓</span>
          <span>DisasterShield<small>Organization portal</small></span>
        </Link>
        <nav className="org-dashboard-nav" aria-label="Organization dashboard">
          <NavLink to="/organization/dashboard" end className={linkClass}>Overview</NavLink>
          <NavLink to="/organization/requests" className={linkClass}>Nearby requests</NavLink>
          <a href="/organization/dashboard#profile" className="org-shell-link">Organization profile</a>
          <NavLink to="/organization/campaigns" className={linkClass}>Campaigns</NavLink>
        </nav>
        <Link to="/organizations" className="org-dashboard-public-link">View public directory</Link>
      </aside>
      <section className="org-dashboard-main">
        <header className="org-dashboard-header">
          <div><p className="eyebrow">Verified response desk</p><h1>{user?.name || "Organization"}</h1></div>
          <div className="org-dashboard-header-actions"><span className="verified-badge">✓ Verified organization</span><NotificationBell /><button type="button" className="nav-logout" onClick={handleLogout}>Logout</button></div>
        </header>
        <Outlet />
      </section>
    </main>
  );
}
