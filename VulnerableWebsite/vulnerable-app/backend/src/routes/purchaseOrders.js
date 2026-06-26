const router = require('express').Router();
const db     = require('../db');
const auth   = require('../middleware/authenticate');

router.get('/', auth, async (req, res) => {
  const search = req.query.search || '';
  try {
    // VULNERABLE: direct interpolation — no parameterization
    const result = await db.query(
      `SELECT * FROM purchase_orders WHERE description ILIKE '%${search}%' ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Query failed' });
  }
});

router.get('/:id', auth, async (req, res) => {
  const r = await db.query(
    'SELECT * FROM purchase_orders WHERE id = $1', [req.params.id]
  );
  if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(r.rows[0]);
});

router.post('/', auth, async (req, res) => {
  const { vendor, description, amount } = req.body;
  const po_number = 'PO-' + Date.now();
  const r = await db.query(
    'INSERT INTO purchase_orders (po_number,vendor,description,amount,created_by) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [po_number, vendor, description, amount, req.user.id]
  );
  res.status(201).json(r.rows[0]);
});

module.exports = router;
