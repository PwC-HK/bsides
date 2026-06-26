import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { th, td, cardWrap, pageH1, input, chip } from '../ui';

const STATUS_COLOR = { draft: '#b794f4', sent: '#4fc3f7', paid: '#68d391', overdue: '#fc8181' };

export default function Invoices() {
  const [status, setStatus] = useState('');
  const [rows, setRows]     = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback((st) => {
    setLoading(true);
    api.get('/invoices', { params: st ? { status: st } : {} })
      .then(r => setRows(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load(status);
  }, [status, load]);

  const outstanding = rows
    .filter(r => r.status === 'sent' || r.status === 'overdue')
    .reduce((s, r) => s + parseFloat(r.total || 0), 0);

  return (
    <div>
      <h1 style={pageH1}>Invoices</h1>

      <div style={{ background: '#fff', borderRadius: 10, padding: '16px 24px', marginBottom: 20,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Outstanding
        </span>
        <span style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e' }}>
          ${outstanding.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      <select
        value={status}
        onChange={e => setStatus(e.target.value)}
        style={{ ...input, marginBottom: 20, width: 180 }}
      >
        <option value="">All statuses</option>
        <option value="draft">draft</option>
        <option value="sent">sent</option>
        <option value="paid">paid</option>
        <option value="overdue">overdue</option>
      </select>

      <div style={cardWrap}>
        {loading && <div style={{ padding: 16, color: '#888' }}>Loading…</div>}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['Invoice #','Customer','Issue Date','Due Date','Total','Status'].map(h => (
              <th key={h} style={th}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td style={{ ...td, fontWeight: 600 }}>{r.invoice_number}</td>
                <td style={td}>{r.customer_name}</td>
                <td style={{ ...td, color: '#888' }}>{new Date(r.issue_date).toLocaleDateString()}</td>
                <td style={{ ...td, color: '#888' }}>{new Date(r.due_date).toLocaleDateString()}</td>
                <td style={td}>${parseFloat(r.total || 0).toLocaleString()}</td>
                <td style={td}><span style={chip(STATUS_COLOR[r.status])}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && rows.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: '#aaa' }}>No results</div>
        )}
      </div>
    </div>
  );
}
