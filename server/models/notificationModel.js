const pool = require("../db/pool");

async function getForUser(userId) {
  const { rows } = await pool.query(
    `select id, title, message, read, created_at from notifications
     where user_id = $1 order by created_at desc limit 50`,
    [userId]
  );
  return rows;
}

async function markRead(id, userId) {
  const { rows } = await pool.query(
    `update notifications set read = true where id = $1 and user_id = $2
     returning id, title, message, read, created_at`,
    [id, userId]
  );
  return rows[0] || null;
}

async function markAllRead(userId) {
  await pool.query(`update notifications set read = true where user_id = $1 and read = false`, [userId]);
}

module.exports = { getForUser, markRead, markAllRead };
