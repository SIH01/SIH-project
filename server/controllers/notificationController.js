const { getForUser, markRead, markAllRead } = require("../models/notificationModel");

// GET /api/notifications — the logged-in user's own notifications only.
async function listMine(req, res) {
  try {
    const notifications = await getForUser(req.user.id);
    res.json({ notifications });
  } catch (err) {
    console.error("listMine error:", err.message);
    res.status(500).json({ error: "Could not load notifications." });
  }
}

// PUT /api/notifications/:id/read
async function markOneRead(req, res) {
  try {
    const notification = await markRead(req.params.id, req.user.id);
    if (!notification) return res.status(404).json({ error: "Notification not found." });
    res.json({ notification });
  } catch (err) {
    console.error("markOneRead error:", err.message);
    res.status(500).json({ error: "Could not update notification." });
  }
}

// PUT /api/notifications/read-all
async function markAllMineRead(req, res) {
  try {
    await markAllRead(req.user.id);
    res.json({ success: true });
  } catch (err) {
    console.error("markAllMineRead error:", err.message);
    res.status(500).json({ error: "Could not update notifications." });
  }
}

module.exports = { listMine, markOneRead, markAllMineRead };
