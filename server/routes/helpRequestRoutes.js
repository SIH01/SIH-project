const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const { requireAdmin } = require("../middleware/authMiddleware");
const controller = require("../controllers/helpRequestController");

const submissionLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false, message: { error: "Too many requests. Please try again later." } });

router.post("/", submissionLimiter, controller.create);
router.get("/", requireAdmin, controller.list);
router.patch("/:id", requireAdmin, controller.update);

module.exports = router;