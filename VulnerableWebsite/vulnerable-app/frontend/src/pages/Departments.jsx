import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { cardWrap, pageH1 } from '../ui';

const DEPT_COLOR = {
  Finance: '#4fc3f7', HR: '#f6ad55', IT: '#68d391',
  Operations: '#b794f4', Procurement: '#fc8181'
};

export default function Departments() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get('/departments')
      .then(r => setRows(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 style={pageH1}>Departments</h1>

      {loading && <div style={{ color: '#888' }}>Loading…</div>}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
        {rows.map(d => {
          const color = DEPT_COLOR[d.name] || '#1a1a2e';
          return (
            <div key={d.id} style={{ ...cardWrap, width: 280, borderTop: `4px solid ${color}` }}>
              <div style={{ padding: '20px 24px' }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14 }}>{d.name}</h2>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ background: color + '22', color, padding: '3px 12px',
                                 borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
                    {d.headcount} staff
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#888', textTransform: 'uppercase',
                              letterSpacing: '0.06em', marginTop: 14 }}>Budget</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', marginTop: 4 }}>
                  ${parseFloat(d.budget || 0).toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!loading && rows.length === 0 && (
        <div style={{ padding: 32, textAlign: 'center', color: '#aaa' }}>No departments</div>
      )}
    </div>
  );
}
