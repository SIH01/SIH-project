const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../middleware/authMiddleware");
const controller = require("../controllers/reliefRequestController");

router.post("/", controller.create);
router.get("/", requireAdmin, controller.list);
router.patch("/:id", requireAdmin, controller.update);

module.exports = router;