const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // required for Supabase's hosted Postgres
});

pool.on("connect", (client) => {
  client.query("SET client_encoding TO 'UTF8'").catch((error) => {
    console.error("Could not set PostgreSQL client encoding:", error.message);
  });
});

module.exports = pool;
