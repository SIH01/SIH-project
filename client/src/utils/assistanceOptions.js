export const REQUEST_TYPES = [
  "Food", "Shelter", "Medical", "Mental Health",
  "Missing People", "Financial", "Other",
];
export const REQUEST_STATUSES = ["Pending", "In Progress", "Resolved"];

const STATUS_BADGE = {
  Pending: "badge-relief",
  "In Progress": "badge-awareness",
  Resolved: "badge-awareness",
};
export function badgeForStatus(status) {
  return STATUS_BADGE[status] || "badge-awareness";
}
