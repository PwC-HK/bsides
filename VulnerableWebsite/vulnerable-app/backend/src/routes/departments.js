const router = require('express').Router();
const db     = require('../db');
const auth   = require('../middleware/authenticate');

router.get('/', auth, async (_req, res) => {
  try {
    const r = await db.query(
      `SELECT d.*, COUNT(e.id)::int AS headcount
       FROM departments d
       LEFT JOIN employees e ON e.department = d.name
       GROUP BY d.id
       ORDER BY d.name`
    );
    res.json(r.rows);
  } catch {
    res.status(500).json({ error: 'Query failed' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const r = await db.query(
      `SELECT d.*, COUNT(e.id)::int AS headcount
       FROM departments d
       LEFT JOIN employees e ON e.department = d.name
       WHERE d.id = $1
       GROUP BY d.id`,
      [req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch {
    res.status(500).json({ error: 'Query failed' });
  }
});

module.exports = router;
