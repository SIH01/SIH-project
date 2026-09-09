require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const disasterRoutes = require("./routes/disasterRoutes");
const assistanceRoutes = require("./routes/assistanceRoutes");
const organizationRoutes = require("./routes/organizationRoutes");
const missingPersonRoutes = require("./routes/missingPersonRoutes");
const campaignRoutes = require("./routes/campaignRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Stage 11 — basic hardening. helmet sets sane security headers; the
// general limiter covers the whole API, with a stricter one on auth
// endpoints (the most common target for credential-stuffing/spam).
app.use(helmet());
app.use(cors());
app.use(express.json());

const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use("/api/", generalLimiter);
app.use("/api/auth", authLimiter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", stage: 12 });
});

app.use("/api/auth", authRoutes);
app.use("/api/disasters", disasterRoutes);
app.use("/api/assistance", assistanceRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/missing-persons", missingPersonRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`DisasterShield API running on http://localhost:${PORT}`);
});
