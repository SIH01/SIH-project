const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/authMiddleware");
const { listMine, markOneRead, markAllMineRead } = require("../controllers/notificationController");

// Any logged-in role (user/organization/admin) — always scoped to req.user.id.
router.get("/", requireAuth, listMine);
router.put("/read-all", requireAuth, markAllMineRead);
router.put("/:id/read", requireAuth, markOneRead);

module.exports = router;
