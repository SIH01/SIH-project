const pool = require("../db/pool");

// Records an administrative action for the audit trail. Never rely on
// this to block the action itself if logging fails — log, don't gate.
async function logAdminAction(adminId, action, targetType, targetId, details) {
  try {
    await pool.query(
      `insert into audit_logs (admin_id, action, target_type, target_id, details)
       values ($1, $2, $3, $4, $5)`,
      [adminId, action, targetType, targetId || null, details || null]
    );
  } catch (err) {
    console.error("auditLog error:", err.message);
  }
}

module.exports = { logAdminAction };
