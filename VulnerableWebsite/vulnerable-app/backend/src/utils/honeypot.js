// debugMessage trip logger.
// The decoy endpoints (routes/internal.js, the /admin/diagnostic trap) are
// DESIGNED to look exploitable but only LOG + deceive — they never actually do
// anything sensitive. This helper records every hit into audit_logs so the
// defender can see who went beyond normal use.
const db = require('../db');

async function logTrip(req, action, payload) {
  try {
    await db.query(
      'INSERT INTO audit_logs (user_id, action, endpoint, payload, ip_address) VALUES ($1, $2, $3, $4, $5)',
      [
        req.user ? req.user.id : null,
        action,
        req.originalUrl || req.path,
        JSON.stringify(payload || {}),
        req.ip || null
      ]
    );
  } catch {
    // never let logging break the trap's response
  }
}

module.exports = { logTrip };
