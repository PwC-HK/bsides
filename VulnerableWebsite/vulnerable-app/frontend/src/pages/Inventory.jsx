import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { th, td, cardWrap, pageH1, input, chip } from '../ui';

export default function Inventory() {
  const [search, setSearch] = useState('');
  const [rows, setRows]     = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback((q) => {
    setLoading(true);
    api.get('/products', { params: { search: q } })
      .then(r => setRows(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(search), 300);
    return () => clearTimeout(t);
  }, [search, load]);

  const totalValue = rows.reduce((s, r) => s + (parseFloat(r.price || 0) * parseFloat(r.stock_qty || 0)), 0);

  const stockState = (r) => {
    const qty = parseFloat(r.stock_qty || 0);
    if (qty === 0) return { label: 'Out of Stock', color: '#fc8181' };
    if (qty <= parseFloat(r.reorder_level || 0)) return { label: 'Low Stock', color: '#f6ad55' };
    return { label: 'In Stock', color: '#68d391' };
  };

  return (
    <div>
      <h1 style={pageH1}>Inventory</h1>

      <div style={{ background: '#fff', borderRadius: 10, padding: '16px 24px', marginBottom: 20,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Total Inventory Value
        </span>
        <span style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e' }}>
          ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      <input
        placeholder="Search products…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ ...input, width: 320, marginBottom: 20 }}
      />

      <div style={cardWrap}>
        {loading && <div style={{ padding: 16, color: '#888' }}>Loading…</div>}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['SKU','Name','Category','Price','Cost','Stock','Status'].map(h => (
              <th key={h} style={th}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const st = stockState(r);
              return (
                <tr key={r.id}>
                  <td style={{ ...td, fontWeight: 600 }}>{r.sku}</td>
                  <td style={td}>{r.name}</td>
                  <td style={td}>{r.category}</td>
                  <td style={td}>${parseFloat(r.price || 0).toLocaleString()}</td>
                  <td style={td}>${parseFloat(r.cost || 0).toLocaleString()}</td>
                  <td style={td}>{r.stock_qty}</td>
                  <td style={td}><span style={chip(st.color)}>{st.label}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!loading && rows.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: '#aaa' }}>No results</div>
        )}
      </div>
    </div>
  );
}
