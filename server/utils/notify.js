const pool = require("../db/pool");

// Fire-and-forget notification insert. Callers await it but a failure here
// should never break the action that triggered it (e.g. an org accepting a
// request should still succeed even if the notification insert fails).
async function notify(userId, title, message) {
  if (!userId) return null;
  try {
    const { rows } = await pool.query(
      `insert into notifications (user_id, title, message)
       values ($1, $2, $3) returning id, user_id, title, message, read, created_at`,
      [userId, title, message]
    );
    return rows[0];
  } catch (err) {
    console.error("notify error:", err.message);
    return null;
  }
}

module.exports = { notify };
