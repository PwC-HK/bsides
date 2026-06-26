const router = require('express').Router();
const db     = require('../db');
const auth   = require('../middleware/authenticate');

router.get('/', auth, async (_req, res) => {
  const r = await db.query(
    'SELECT id,full_name,department,position,salary FROM employees ORDER BY full_name'
  );
  res.json(r.rows);
});

router.get('/:id', auth, async (req, res) => {
  const r = await db.query('SELECT * FROM employees WHERE id = $1', [req.params.id]);
  if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
  res.json(r.rows[0]);
});

module.exports = router;
