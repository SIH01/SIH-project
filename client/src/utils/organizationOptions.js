// These must match server/controllers/organizationController.js exactly —
// the backend validates against these exact strings.
export const ORG_TYPES = [
  "NGO", "Charity", "Volunteer Group", "Food Distribution", "Medical",
  "Shelter Provider", "Search and Rescue", "Mental Health", "Other",
];

export const ASSISTANCE_CATEGORIES = [
  "Food", "Water", "Medical", "Shelter", "Missing-person assistance",
  "Financial assistance", "Mental-health support", "Search and rescue",
  "Essential supplies", "Other",
];

const VERIFICATION_BADGE = {
  Pending: "badge-awareness",
  "Under Review": "badge-awareness",
  Verified: "badge-relief",
  Rejected: "badge-relief",
  Suspended: "badge-relief",
};
export function badgeForVerification(status) {
  return VERIFICATION_BADGE[status] || "badge-awareness";
}
