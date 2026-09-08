const pool = require("../db/pool");

async function findByEmail(email) {
  const { rows } = await pool.query(
    "select * from users where lower(email) = lower($1)",
    [email]
  );
  return rows[0] || null;
}

async function createUser({ name, email, passwordHash, role = "user" }) {
  const { rows } = await pool.query(
    `insert into users (name, email, password_hash, role)
     values ($1, $2, $3, $4)
     returning id, name, email, role, created_at`,
    [name, email, passwordHash, role]
  );
  return rows[0];
}

module.exports = { findByEmail, createUser };
