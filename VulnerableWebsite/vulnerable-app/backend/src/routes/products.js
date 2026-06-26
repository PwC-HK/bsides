const router     = require('express').Router();
const db         = require('../db');
const auth       = require('../middleware/authenticate');
const requireRole = require('../middleware/requireRole');

router.get('/', auth, async (req, res) => {
  try {
    const search = req.query.search;
    let r;
    if (search) {
      r = await db.query(
        `SELECT * FROM products
         WHERE (name ILIKE $1 OR sku ILIKE $1 OR category ILIKE $1)
         ORDER BY name`,
        ['%' + search + '%']
      );
    } else {
      r = await db.query('SELECT * FROM products ORDER BY name');
    }
    res.json(r.rows);
  } catch {
    res.status(500).json({ error: 'Query failed' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const r = await db.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch {
    res.status(500).json({ error: 'Query failed' });
  }
});

router.post('/', auth, requireRole('manager'), async (req, res) => {
  try {
    const { sku, name, category, price, cost, stock_qty, reorder_level, supplier_id } = req.body;
    if (!sku || !name) return res.status(400).json({ error: 'sku and name are required' });
    const r = await db.query(
      `INSERT INTO products (sku, name, category, price, cost, stock_qty, reorder_level, supplier_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        sku,
        name,
        category || null,
        price,
        cost,
        stock_qty || 0,
        reorder_level || 10,
        supplier_id || null
      ]
    );
    res.status(201).json(r.rows[0]);
  } catch {
    res.status(500).json({ error: 'Query failed' });
  }
});

router.put('/:id', auth, requireRole('manager'), async (req, res) => {
  try {
    const { sku, name, category, price, cost, stock_qty, reorder_level, supplier_id } = req.body;
    const r = await db.query(
      `UPDATE products
       SET sku            = COALESCE($1, sku),
           name           = COALESCE($2, name),
           category       = COALESCE($3, category),
           price          = COALESCE($4, price),
           cost           = COALESCE($5, cost),
           stock_qty      = COALESCE($6, stock_qty),
           reorder_level  = COALESCE($7, reorder_level),
           supplier_id    = COALESCE($8, supplier_id)
       WHERE id = $9 RETURNING *`,
      [sku, name, category, price, cost, stock_qty, reorder_level, supplier_id, req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch {
    res.status(500).json({ error: 'Query failed' });
  }
});

module.exports = router;
