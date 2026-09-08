const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { findByEmail, createUser } = require("../models/userStore");

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRY = "8h";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

// POST /api/auth/register — always creates a "user" role account.
// Organizations register through a separate flow in Stage 6 (their
// account isn't usable until an admin verifies it), and there is no
// public admin sign-up at all — see scripts/createAdmin.js.
async function register(req, res) {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: "All fields are required." });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Enter a valid email address." });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match." });
  }

  try {
    if (await findByEmail(email)) {
      return res.status(409).json({ error: "An account with that email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({ name, email, passwordHash, role: "user" });
    const token = signToken({ id: user.id, role: user.role, email: user.email });

    return res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    console.error("register error:", err.message);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}

// Shared logic for the three role-specific logins below.
async function loginAs(expectedRole, req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const user = await findByEmail(email);
    if (!user || user.role !== expectedRole) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = signToken({ id: user.id, role: user.role, email: user.email });
    return res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error(`${expectedRole} login error:`, err.message);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}

// POST /api/auth/login — general users
const login = (req, res) => loginAs("user", req, res);

// POST /api/auth/admin-login
const adminLogin = (req, res) => loginAs("admin", req, res);

// POST /api/auth/organization-login
// No organizations exist until Stage 6 builds registration + admin
// verification — this endpoint is ready and wired in ahead of that.
const organizationLogin = (req, res) => loginAs("organization", req, res);

module.exports = { register, login, adminLogin, organizationLogin };
