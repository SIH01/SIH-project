import React from "react";
import { DISASTER_TYPES, DISASTER_STATUSES, DISASTER_SEVERITIES } from "../utils/disasterOptions";

const TIME_OPTIONS = ["All", "Last year", "Last 5 years", "Last 10 years", "Older"];
const SORT_OPTIONS = [
  { value: "distance", label: "Distance" },
  { value: "date", label: "Date" },
  { value: "severity", label: "Severity" },
];

const selectStyle = {
  padding: "0.5rem 0.7rem",
  border: "1px solid var(--line)",
  borderRadius: "4px",
  fontSize: "0.88rem",
  fontFamily: "var(--font-body)",
  background: "#fff",
};

export default function DisasterFilters({ filters, onChange }) {
  function set(key, value) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
      <select style={selectStyle} value={filters.type} onChange={(e) => set("type", e.target.value)}>
        <option value="All">All Types</option>
        {DISASTER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>

      <select style={selectStyle} value={filters.severity} onChange={(e) => set("severity", e.target.value)}>
        <option value="All">All Severities</option>
        {DISASTER_SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      <select style={selectStyle} value={filters.status} onChange={(e) => set("status", e.target.value)}>
        <option value="All">All Statuses</option>
        {DISASTER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      <select style={selectStyle} value={filters.time} onChange={(e) => set("time", e.target.value)}>
        {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>

      <select style={selectStyle} value={filters.sortBy} onChange={(e) => set("sortBy", e.target.value)}>
        {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>Sort: {o.label}</option>)}
      </select>
    </div>
  );
}