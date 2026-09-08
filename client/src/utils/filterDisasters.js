const SEVERITY_RANK = { Low: 1, Moderate: 2, High: 3, Severe: 4 };

export const DEFAULT_FILTERS = { type: "All", severity: "All", status: "All", time: "All", sortBy: "distance" };

export function applyDisasterFilters(disasters, filters) {
  const now = new Date();

  let result = disasters.filter((d) => {
    if (filters.type !== "All" && d.type !== filters.type) return false;
    if (filters.severity !== "All" && d.severity !== filters.severity) return false;
    if (filters.status !== "All" && d.status !== filters.status) return false;

    if (filters.time !== "All") {
      const yearsAgo = (now - new Date(d.date)) / (1000 * 60 * 60 * 24 * 365.25);
      if (filters.time === "Last year" && yearsAgo > 1) return false;
      if (filters.time === "Last 5 years" && yearsAgo > 5) return false;
      if (filters.time === "Last 10 years" && yearsAgo > 10) return false;
      if (filters.time === "Older" && yearsAgo <= 10) return false;
    }
    return true;
  });

  result = [...result].sort((a, b) => {
    if (filters.sortBy === "date") return new Date(b.date) - new Date(a.date);
    if (filters.sortBy === "severity") return SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity];
    return a.distance_km - b.distance_km; // default: distance
  });

  return result;
}