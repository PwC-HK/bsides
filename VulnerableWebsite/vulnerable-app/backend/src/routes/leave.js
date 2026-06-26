const router = require('express').Router();
const db     = require('../db');
const auth   = require('../middleware/authenticate');

// Allow manager OR admin to decide leave requests (requireRole only matches one exact role).
function requireManagerOrAdmin(req, res, next) {
  if (!req.user || (req.user.role !== 'manager' && req.user.role !== 'admin'))
    return res.status(403).json({ error: 'Forbidden' });
  next();
}

router.get('/', auth, async (_req, res) => {
  try {
    const r = await db.query(
      `SELECT l.*, u.username
       FROM leave_requests l
       JOIN users u ON u.id = l.user_id
       ORDER BY l.created_at DESC`
    );
    res.json(r.rows);
  } catch {
    res.status(500).json({ error: 'Query failed' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { leave_type, start_date, end_date, reason } = req.body;
    if (!leave_type || !start_date || !end_date)
      return res.status(400).json({ error: 'leave_type, start_date and end_date are required' });
    const r = await db.query(
      `INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, reason, status)
       VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING *`,
      [req.user.id, leave_type, start_date, end_date, reason || null]
    );
    res.status(201).json(r.rows[0]);
  } catch {
    res.status(500).json({ error: 'Query failed' });
  }
});

router.patch('/:id', auth, requireManagerOrAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status))
      return res.status(400).json({ error: 'status must be approved or rejected' });
    const r = await db.query(
      `UPDATE leave_requests
       SET status = $1, decided_by = $2
       WHERE id = $3 RETURNING *`,
      [status, req.user.id, req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch {
    res.status(500).json({ error: 'Query failed' });
  }
});

module.exports = router;
