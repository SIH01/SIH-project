const pool = require("../db/pool");

// GET /api/admin/stats — the numbers behind the Admin Dashboard (Section 24).
// Each is a small independent query rather than one giant join, since the
// tables aren't related in a way that joins cleanly for counts like these.
async function getStats(req, res) {
  try {
    const [
      users, disasters, activeDisasters, requests, pendingRequests, resolvedRequests,
      verifiedOrgs, pendingOrgs, activeCampaigns, fundsRaised,
    ] = await Promise.all([
      pool.query("select count(*)::int as n from users"),
      pool.query("select count(*)::int as n from disasters"),
      pool.query("select count(*)::int as n from disasters where status = 'Current'"),
      pool.query("select count(*)::int as n from assistance_requests"),
      pool.query("select count(*)::int as n from assistance_requests where status = 'Pending'"),
      pool.query("select count(*)::int as n from assistance_requests where status = 'Resolved'"),
      pool.query("select count(*)::int as n from organizations where verification_status = 'Verified'"),
      pool.query("select count(*)::int as n from organizations where verification_status in ('Pending', 'Under Review')"),
      pool.query("select count(*)::int as n from fundraising_campaigns where status = 'Active'"),
      pool.query("select coalesce(sum(amount_raised), 0)::float as n from fundraising_campaigns"),
    ]);

    res.json({
      total_users: users.rows[0].n,
      total_disasters: disasters.rows[0].n,
      active_disasters: activeDisasters.rows[0].n,
      total_relief_requests: requests.rows[0].n,
      pending_relief_requests: pendingRequests.rows[0].n,
      completed_requests: resolvedRequests.rows[0].n,
      verified_organizations: verifiedOrgs.rows[0].n,
      pending_organizations: pendingOrgs.rows[0].n,
      active_campaigns: activeCampaigns.rows[0].n,
      funds_raised: fundsRaised.rows[0].n,
    });
  } catch (err) {
    console.error("getStats error:", err.message);
    res.status(500).json({ error: "Could not load statistics." });
  }
}

// GET /api/admin/audit-logs — chronological trail of admin actions.
async function getAuditLogs(req, res) {
  try {
    const { rows } = await pool.query(
      `select al.id, al.action, al.target_type, al.target_id, al.details, al.created_at,
              u.name as admin_name, u.email as admin_email
       from audit_logs al
       left join users u on u.id = al.admin_id
       order by al.created_at desc
       limit 200`
    );
    res.json({ logs: rows });
  } catch (err) {
    console.error("getAuditLogs error:", err.message);
    res.status(500).json({ error: "Could not load audit logs." });
  }
}

module.exports = { getStats, getAuditLogs };
