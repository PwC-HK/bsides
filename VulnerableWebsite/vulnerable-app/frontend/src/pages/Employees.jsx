import React, { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Employees() {
  const [rows, setRows] = useState([]);
  useEffect(() => { api.get('/employees').then(r => setRows(r.data)).catch(() => {}); }, []);

  const th = { padding: '10px 14px', textAlign: 'left', fontSize: 11,
               fontWeight: 700, color: '#888', textTransform: 'uppercase',
               letterSpacing: '0.06em', borderBottom: '1px solid #eee' };
  const td = { padding: '12px 14px', borderBottom: '1px solid #f5f5f5', fontSize: 13 };
  const DEPT_COLOR = {
    Finance: '#4fc3f7', HR: '#f6ad55', IT: '#68d391',
    Operations: '#b794f4', Procurement: '#fc8181'
  };

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Employees</h1>
      <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['Name','Department','Position','Salary'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td style={{ ...td, fontWeight: 600 }}>{r.full_name}</td>
                <td style={td}>
                  <span style={{ background: (DEPT_COLOR[r.department] || '#ccc') + '22',
                                 color: DEPT_COLOR[r.department] || '#666',
                                 padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                    {r.department}
                  </span>
                </td>
                <td style={td}>{r.position}</td>
                <td style={td}>${parseFloat(r.salary).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
