const jwt = require("jsonwebtoken");

// Like requireAuth, but never blocks the request — just attaches req.user
// if a valid token is present. Used on public endpoints (e.g. submitting an
// assistance request) that behave slightly differently for logged-in users.
function optionalAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next();
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    // Invalid/expired token on a public route — just proceed as anonymous.
  }
  next();
}

module.exports = { optionalAuth };
