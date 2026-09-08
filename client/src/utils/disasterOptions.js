export const DISASTER_TYPES = [
  "Flood", "Earthquake", "Cyclone", "Tsunami", "Landslide", "Wildfire",
  "Drought", "Extreme Heat", "Extreme Cold", "Avalanche", "Storm",
  "Volcanic Eruption", "Other",
];
export const DISASTER_STATUSES = ["Historical", "Current", "Forecast"];
export const DISASTER_SEVERITIES = ["Low", "Moderate", "High", "Severe"];

const TYPE_COLORS = {
  Flood: "#2f6f76",
  Earthquake: "#8a5a2b",
  Cyclone: "#5566c9",
  Tsunami: "#1c5f8a",
  Landslide: "#7a5230",
  Wildfire: "#c1443a",
  Drought: "#c99a2e",
  "Extreme Heat": "#d9622e",
  "Extreme Cold": "#4a8fc2",
  Avalanche: "#8fa3b8",
  Storm: "#5c5470",
  "Volcanic Eruption": "#a13d2b",
  Other: "#6b7280",
};
export function colorForType(type) {
  return TYPE_COLORS[type] || TYPE_COLORS.Other;
}

const SEVERITY_RADIUS = { Low: 6, Moderate: 8, High: 10, Severe: 13 };
export function radiusForSeverity(severity) {
  return SEVERITY_RADIUS[severity] || 7;
}