const router = require('express').Router();
const db     = require('../db');
const auth   = require('../middleware/authenticate');

router.get('/', auth, async (req, res) => {
  try {
    const search = req.query.search;
    let r;
    if (search) {
      r = await db.query(
        `SELECT * FROM customers
         WHERE (name ILIKE $1 OR company ILIKE $1 OR email ILIKE $1)
         ORDER BY name`,
        ['%' + search + '%']
      );
    } else {
      r = await db.query('SELECT * FROM customers ORDER BY name');
    }
    res.json(r.rows);
  } catch {
    res.status(500).json({ error: 'Query failed' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const r = await db.query('SELECT * FROM customers WHERE id = $1', [req.params.id]);
    if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch {
    res.status(500).json({ error: 'Query failed' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, company, email, phone, status, credit_limit } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const r = await db.query(
      `INSERT INTO customers (name, company, email, phone, status, credit_limit)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        name,
        company || null,
        email || null,
        phone || null,
        status || 'active',
        credit_limit || 0
      ]
    );
    res.status(201).json(r.rows[0]);
  } catch {
    res.status(500).json({ error: 'Query failed' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { name, company, email, phone, status, credit_limit } = req.body;
    const r = await db.query(
      `UPDATE customers
       SET name = COALESCE($1, name),
           company = COALESCE($2, company),
           email = COALESCE($3, email),
           phone = COALESCE($4, phone),
           status = COALESCE($5, status),
           credit_limit = COALESCE($6, credit_limit)
       WHERE id = $7 RETURNING *`,
      [name, company, email, phone, status, credit_limit, req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch {
    res.status(500).json({ error: 'Query failed' });
  }
});

module.exports = router;
