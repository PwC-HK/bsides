const router     = require('express').Router();
const db         = require('../db');
const auth       = require('../middleware/authenticate');
const requireRole = require('../middleware/requireRole');

// Helper to build optional-filter queries safely (parameterized).
function buildFilter(conditions, params) {
  return conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
}

router.get('/', auth, async (req, res) => {
  try {
    const { status, customer_id } = req.query;
    const conds = [];
    const params = [];
    if (status) {
      params.push(status);
      conds.push(`i.status = $${params.length}`);
    }
    if (customer_id) {
      params.push(customer_id);
      conds.push(`i.customer_id = $${params.length}`);
    }
    const where = buildFilter(conds, params);
    const r = await db.query(
      `SELECT i.*, c.name AS customer_name
       FROM invoices i
       LEFT JOIN customers c ON c.id = i.customer_id
       ${where}
       ORDER BY i.issue_date DESC`,
      params
    );
    res.json(r.rows);
  } catch {
    res.status(500).json({ error: 'Query failed' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const r = await db.query(
      `SELECT i.*, c.name AS customer_name
       FROM invoices i
       LEFT JOIN customers c ON c.id = i.customer_id
       WHERE i.id = $1`,
      [req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch {
    res.status(500).json({ error: 'Query failed' });
  }
});

router.post('/', auth, requireRole('manager'), async (req, res) => {
  try {
    const { invoice_no, customer_id, issue_date, due_date, amount, tax } = req.body;
    if (!invoice_no) return res.status(400).json({ error: 'invoice_no is required' });
    const amt = Number(amount) || 0;
    const tx  = Number(tax) || 0;
    const total = amt + tx;
    const r = await db.query(
      `INSERT INTO invoices (invoice_no, customer_id, issue_date, due_date, amount, tax, total, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft', $8) RETURNING *`,
      [
        invoice_no,
        customer_id || null,
        issue_date || null,
        due_date || null,
        amt,
        tx,
        total,
        req.user.id
      ]
    );
    res.status(201).json(r.rows[0]);
  } catch {
    res.status(500).json({ error: 'Query failed' });
  }
});

module.exports = router;
