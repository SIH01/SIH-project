// Run with: node scripts/createAdmin.js
// There is no admin sign-up page in the app — this is the only way to
// create (or promote an existing account to) an admin.

require("dotenv").config();
const readline = require("readline");
const bcrypt = require("bcryptjs");
const pool = require("../db/pool");

function ask(rl, question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const name = await ask(rl, "Admin name: ");
  const email = await ask(rl, "Admin email: ");
  const password = await ask(rl, "Admin password (min 8 characters): ");
  rl.close();

  if (!name || !email || !password || password.length < 8) {
    console.error("All fields are required and password must be at least 8 characters.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const existing = await pool.query("select id from users where lower(email) = lower($1)", [email]);

  if (existing.rows.length > 0) {
    await pool.query(
      "update users set role = 'admin', password_hash = $1, name = $2 where lower(email) = lower($3)",
      [passwordHash, name, email]
    );
    console.log(`Existing account for ${email} upgraded to admin.`);
  } else {
    await pool.query(
      "insert into users (name, email, password_hash, role) values ($1, $2, $3, 'admin')",
      [name, email, passwordHash]
    );
    console.log(`Admin account created for ${email}.`);
  }

  await pool.end();
}

main().catch((err) => {
  console.error("Failed to create admin:", err.message);
  process.exit(1);
});
