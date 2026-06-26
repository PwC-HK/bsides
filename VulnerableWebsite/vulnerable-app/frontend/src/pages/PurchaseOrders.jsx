import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

const STATUS_COLOR = { pending: '#f6ad55', approved: '#68d391', rejected: '#fc8181' };

export default function PurchaseOrders() {
  const [search, setSearch]   = useState('');
  const [rows,   setRows]     = useState([]);
  const [loading,setLoading]  = useState(false);

  const load = useCallback((q) => {
    setLoading(true);
    api.get('/purchase-orders', { params: { search: q } })
       .then(r => setRows(r.data))
       .catch(() => {})
       .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(search), 300);
    return () => clearTimeout(t);
  }, [search, load]);

  const th = { padding: '10px 14px', textAlign: 'left', fontSize: 11,
               fontWeight: 700, color: '#888', textTransform: 'uppercase',
               letterSpacing: '0.06em', borderBottom: '1px solid #eee' };
  const td = { padding: '12px 14px', borderBottom: '1px solid #f5f5f5', fontSize: 13 };

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Purchase Orders</h1>
      <input
        placeholder="Search orders…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ padding: '10px 14px', border: '1px solid #ddd', borderRadius: 6,
                 fontSize: 14, width: 320, marginBottom: 20, outline: 'none' }}
      />
      <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {loading && <div style={{ padding: 16, color: '#888' }}>Loading…</div>}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['PO Number','Vendor','Description','Amount','Status','Date'].map(h => (
                <th key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td style={td}>{r.po_number}</td>
                <td style={td}>{r.vendor}</td>
                <td style={{ ...td, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</td>
                <td style={td}>${parseFloat(r.amount).toLocaleString()}</td>
                <td style={td}>
                  <span style={{ background: STATUS_COLOR[r.status] + '22',
                                 color: STATUS_COLOR[r.status], padding: '3px 10px',
                                 borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                    {r.status}
                  </span>
                </td>
                <td style={{ ...td, color: '#888' }}>
                  {new Date(r.created_at).toLocaleDateString()}
                </td>
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
