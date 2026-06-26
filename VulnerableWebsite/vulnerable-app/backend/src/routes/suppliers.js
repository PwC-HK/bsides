const router     = require('express').Router();
const db         = require('../db');
const auth       = require('../middleware/authenticate');
const requireRole = require('../middleware/requireRole');

router.get('/', auth, async (_req, res) => {
  try {
    const r = await db.query('SELECT * FROM suppliers ORDER BY name');
    res.json(r.rows);
  } catch {
    res.status(500).json({ error: 'Query failed' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const r = await db.query('SELECT * FROM suppliers WHERE id = $1', [req.params.id]);
    if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch {
    res.status(500).json({ error: 'Query failed' });
  }
});

router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const { name, contact_email, phone, country } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const r = await db.query(
      `INSERT INTO suppliers (name, contact_email, phone, country)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, contact_email || null, phone || null, country || null]
    );
    res.status(201).json(r.rows[0]);
  } catch {
    res.status(500).json({ error: 'Query failed' });
  }
});

module.exports = router;
