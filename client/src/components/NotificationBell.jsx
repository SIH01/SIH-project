import React, { useEffect, useRef, useState } from "react";
import { api } from "../services/api";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  async function load() {
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data.notifications || []);
    } catch {
      // notifications are a convenience, not critical path — fail silently
    }
  }

  useEffect(() => {
    load();
    const timer = setInterval(load, 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function markOne(id) {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch {
      // ignore
    }
  }

  async function markAll() {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // ignore
    }
  }

  return (
    <div ref={boxRef} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notifications"
        style={{ position: "relative", background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem", padding: "0.3rem 0.5rem", color: "inherit" }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{ position: "absolute", top: 0, right: 0, background: "var(--relief)", color: "#fff", borderRadius: "999px", fontSize: "0.65rem", padding: "1px 5px", fontWeight: 700 }}>
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position: "absolute", right: 0, top: "2.2rem", width: "300px", maxHeight: "360px", overflowY: "auto", background: "#fff", border: "1px solid var(--line)", borderRadius: "8px", boxShadow: "0 10px 30px rgba(16,27,45,0.12)", zIndex: 50 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.7rem 0.9rem", borderBottom: "1px solid var(--line)" }}>
            <strong style={{ fontSize: "0.9rem" }}>Notifications</strong>
            {unreadCount > 0 && <button onClick={markAll} style={{ background: "none", border: "none", color: "var(--awareness-dark)", fontSize: "0.78rem", cursor: "pointer" }}>Mark all read</button>}
          </div>
          {notifications.length === 0 ? (
            <p style={{ padding: "1rem", fontSize: "0.85rem", color: "#5c6673" }}>No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.read && markOne(n.id)}
                style={{ padding: "0.7rem 0.9rem", borderBottom: "1px solid var(--line)", cursor: n.read ? "default" : "pointer", background: n.read ? "#fff" : "rgba(47,111,118,0.05)" }}
              >
                <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>{n.title}</div>
                <div style={{ fontSize: "0.8rem", color: "#5c6673" }}>{n.message}</div>
                <div style={{ fontSize: "0.7rem", color: "#8892a0", marginTop: "0.2rem" }}>{new Date(n.created_at).toLocaleString()}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}