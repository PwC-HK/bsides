const router = require('express').Router();
const db     = require('../db');
const auth   = require('../middleware/authenticate');

router.get('/', auth, async (_req, res) => {
  try {
    // KPI single-row aggregates
    const [
      revenueRows,
      outstandingRows,
      lowStockRows,
      pendingLeaveRows,
      openPoRows,
      customerCountRows,
      productCountRows,
      revenueSeriesRows,
      poStatusRows,
      headcountRows,
      activityRows
    ] = await Promise.all([
      // totalRevenue: sum of paid invoices
      db.query(`SELECT COALESCE(SUM(total),0)::float AS v FROM invoices WHERE status = 'paid'`, []),
      // outstandingAmount: sum of sent+overdue invoices
      db.query(`SELECT COALESCE(SUM(total),0)::float AS v FROM invoices WHERE status IN ('sent','overdue')`, []),
      // lowStockCount: products at or below reorder level
      db.query(`SELECT COUNT(*)::int AS v FROM products WHERE stock_qty <= reorder_level`, []),
      // pendingLeave
      db.query(`SELECT COUNT(*)::int AS v FROM leave_requests WHERE status = 'pending'`, []),
      // openPOs
      db.query(`SELECT COUNT(*)::int AS v FROM purchase_orders WHERE status = 'pending'`, []),
      // totalCustomers
      db.query(`SELECT COUNT(*)::int AS v FROM customers`, []),
      // totalProducts
      db.query(`SELECT COUNT(*)::int AS v FROM products`, []),
      // revenueSeries: last 6 months of paid+sent grouped by month
      db.query(
        `SELECT to_char(issue_date,'YYYY-MM') AS month,
                COALESCE(SUM(total),0)::float AS revenue
         FROM invoices
         WHERE issue_date >= date_trunc('month', CURRENT_DATE) - INTERVAL '5 months'
           AND status IN ('paid','sent')
         GROUP BY 1
         ORDER BY 1`,
        []
      ),
      // poStatus distribution
      db.query(
        `SELECT status AS name, COUNT(*)::int AS value
         FROM purchase_orders
         GROUP BY status`,
        []
      ),
      // headcount by department
      db.query(
        `SELECT department AS name, COUNT(*)::int AS value
         FROM employees
         WHERE department IS NOT NULL
         GROUP BY department`,
        []
      ),
      // activity: recent 10 across invoices / purchase_orders / leave
      db.query(
        `SELECT type, label, date, id FROM (
           SELECT 'invoice' AS type,
                  ('Invoice ' || invoice_no) AS label,
                  created_at AS date,
                  id
           FROM invoices
           UNION ALL
           SELECT 'purchase_order' AS type,
                  (vendor || ' PO') AS label,
                  created_at AS date,
                  id
           FROM purchase_orders
           UNION ALL
           SELECT 'leave' AS type,
                  (leave_type || ' leave') AS label,
                  created_at AS date,
                  id
           FROM leave_requests
         ) AS a
         ORDER BY date DESC
         LIMIT 10`,
        []
      )
    ]);

    const pick = (r) => (r.rows[0] ? r.rows[0].v : 0);

    // Normalize revenue series to guarantee 6 consecutive months present.
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push(key);
    }
    const seriesMap = {};
    for (const row of revenueSeriesRows.rows) seriesMap[row.month] = row.revenue;
    const revenueSeries = months.map((m) => ({ month: m, revenue: seriesMap[m] || 0 }));

    res.json({
      kpis: {
        totalRevenue: pick(revenueRows),
        outstandingAmount: pick(outstandingRows),
        lowStockCount: pick(lowStockRows),
        pendingLeave: pick(pendingLeaveRows),
        openPOs: pick(openPoRows),
        totalCustomers: pick(customerCountRows),
        totalProducts: pick(productCountRows)
      },
      revenueSeries,
      poStatus: poStatusRows.rows,
      headcountByDept: headcountRows.rows,
      activity: activityRows.rows.map((a) => ({
        type: a.type,
        label: a.label,
        date: a.date,
        id: a.id
      }))
    });
  } catch {
    res.status(500).json({ error: 'Query failed' });
  }
});

module.exports = router;
