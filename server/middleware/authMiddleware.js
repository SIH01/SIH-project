const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Authentication required." });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

// Usage: requireRole("admin"), requireRole("organization"), etc.
// Every admin/organization-only route in later stages lists requireAuth
// first, then requireRole(...) — the frontend hiding a button is never
// treated as the real access control.
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: `${role} access required.` });
    }
    next();
  };
}

// Usage: requireAnyRole("admin", "organization") — for endpoints shared by
// more than one role (e.g. viewing nearby assistance requests).
function requireAnyRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access requires one of: ${roles.join(", ")}.` });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole, requireAnyRole };
