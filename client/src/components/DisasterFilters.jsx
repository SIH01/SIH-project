import React, { useState } from "react";
import { DISASTER_TYPES, DISASTER_STATUSES, DISASTER_SEVERITIES } from "../utils/disasterOptions";

const TIME_OPTIONS = ["All", "Last year", "Last 5 years", "Last 10 years", "Older"];
const SORT_OPTIONS = [
  { value: "distance", label: "Distance" },
  { value: "date", label: "Date" },
  { value: "severity", label: "Severity" },
];

const selectStyle = {
  height: "42px",
  padding: "0 0.9rem",
  border: "1px solid var(--line)",
  borderRadius: "10px",
  fontSize: "0.88rem",
  fontFamily: "var(--font-body)",
  background: "#fff",
  color: "var(--ink-on-paper)",
  boxShadow: "0 2px 8px rgba(16,27,45,0.04)",
};

export default function DisasterFilters({ filters, onChange }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  function set(key, value) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className={`filter-bar ${mobileOpen ? "filter-bar-open" : ""}`}>
      <button className="filter-toggle" type="button" onClick={() => setMobileOpen((open) => !open)}>
        {mobileOpen ? "Hide filters" : "Filters"}
      </button>
      <div className="filter-controls">
      <select style={selectStyle} value={filters.type} onChange={(e) => set("type", e.target.value)} aria-label="Disaster type">
        <option value="All">{filters.type === "All" ? "All Types" : filters.type}</option>
        {DISASTER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>

      <select style={selectStyle} value={filters.severity} onChange={(e) => set("severity", e.target.value)} aria-label="Severity">
        <option value="All">{filters.severity === "All" ? "All Severities" : filters.severity}</option>
        {DISASTER_SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      <select style={selectStyle} value={filters.status} onChange={(e) => set("status", e.target.value)} aria-label="Status">
        <option value="All">{filters.status === "All" ? "All Statuses" : filters.status}</option>
        {DISASTER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      <select style={selectStyle} value={filters.time} onChange={(e) => set("time", e.target.value)} aria-label="Time range">
        {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t === "All" ? "All Time" : t}</option>)}
      </select>

      <select style={selectStyle} value={filters.sortBy} onChange={(e) => set("sortBy", e.target.value)} aria-label="Sort results">
        {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>Sort: {o.label}</option>)}
      </select>
      </div>
    </div>
  );
}