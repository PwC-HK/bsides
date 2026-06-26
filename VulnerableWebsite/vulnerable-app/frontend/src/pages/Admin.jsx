import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';

export default function Admin() {
  const [users,    setUsers]    = useState([]);
  const [filename, setFilename] = useState('');
  const [msg,      setMsg]      = useState('');

  // Hidden debugMessage "tools" mode — normal usage never sets ?tools=1.
  const [params] = useSearchParams();
  const showTools = params.get('tools') === '1';

  // debugMessage intrusion log (the defender payoff).
  const [trips, setTrips] = useState([]);
  const refreshTrips = () => api.get('/admin/debugMessage').then(r => setTrips(r.data)).catch(() => {});

  // Hidden diagnostic console (debugMessage trap — fake RCE).
  const [cmd, setCmd] = useState('');
  const [diagOut, setDiagOut] = useState('');

  useEffect(() => {
    api.get('/admin/users').then(r => setUsers(r.data)).catch(() => {});
    refreshTrips();
  }, []);

  const runBackup = async () => {
    setMsg('');
    try {
      const r = await api.post('/admin/backup', { filename });
      setMsg('Backup created: ' + r.data.file);
    } catch (e) {
      setMsg('Error: ' + (e.response?.data?.error || 'failed'));
    }
  };

  const runDiag = async () => {
    setDiagOut('');
    try {
      const r = await api.post('/admin/diagnostic', { cmd });
      setDiagOut(r.data.output || '(no output)');
      setTimeout(refreshTrips, 300); // the trap logs server-side; refresh to see it
    } catch (e) {
      setDiagOut('Error: ' + (e.response?.data?.error || 'failed'));
    }
  };

  const ROLE_COLOR = { admin: '#fc8181', manager: '#f6ad55', employee: '#68d391' };
  const th = { padding: '10px 14px', textAlign: 'left', fontSize: 11,
               fontWeight: 700, color: '#888', textTransform: 'uppercase',
               letterSpacing: '0.06em', borderBottom: '1px solid #eee' };
  const td = { padding: '12px 14px', borderBottom: '1px solid #f5f5f5', fontSize: 13 };
  const card = { background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' };
  const h2   = { fontSize: 15, fontWeight: 700, marginBottom: 14 };

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Admin Panel</h1>

      <h2 style={h2}>User Management</h2>
      <div style={{ ...card, overflow: 'hidden', marginBottom: 32 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['Username','Email','Role','Created'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={{ ...td, fontWeight: 600 }}>{u.username}</td>
                <td style={td}>{u.email}</td>
                <td style={td}>
                  <span style={{ background: (ROLE_COLOR[u.role] || '#ccc') + '22',
                                 color: ROLE_COLOR[u.role] || '#666',
                                 padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ ...td, color: '#888' }}>{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={h2}>Database Backup</h2>
      <div style={{ ...card, padding: 24, maxWidth: 480 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700,
                        color: '#444', marginBottom: 8, textTransform: 'uppercase' }}>
          Backup filename
        </label>
        <div style={{ display: 'flex', gap: 10 }}>
          <input value={filename} onChange={e => setFilename(e.target.value)}
                 placeholder="e.g. backup_2024_q4"
                 style={{ flex: 1, padding: '10px 12px', border: '1px solid #ddd',
                          borderRadius: 6, fontSize: 14, outline: 'none' }} />
          <button onClick={runBackup}
                  style={{ padding: '10px 20px', background: '#1a1a2e', color: '#fff',
                           border: 'none', borderRadius: 6, fontSize: 13,
                           fontWeight: 600, cursor: 'pointer' }}>
            Run Backup
          </button>
        </div>
        {msg && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: '#f0f9ff',
                        border: '1px solid #bee3f8', borderRadius: 6, fontSize: 13, color: '#2b6cb0' }}>
            {msg}
          </div>
        )}
      </div>

      <h2 style={{ ...h2, marginTop: 32, color: '#c53030' }}>⏚ debugMessage — Intrusion Log</h2>
      <div style={{ ...card, overflow: 'hidden', marginBottom: 16 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['Time','Trap','IP','Detail'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {trips.map(t => (
              <tr key={t.id}>
                <td style={{ ...td, color: '#888', whiteSpace: 'nowrap' }}>{new Date(t.created_at).toLocaleString()}</td>
                <td style={{ ...td, fontFamily: 'monospace' }}>{(t.payload && t.payload.trap) || t.endpoint}</td>
                <td style={{ ...td, fontFamily: 'monospace' }}>{t.ip_address || '—'}</td>
                <td style={{ ...td, fontFamily: 'monospace', fontSize: 12, color: '#666' }}>
                  {t.payload ? JSON.stringify({ ...t.payload, trap: undefined }) : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {trips.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center', color: '#aaa' }}>
            No trips yet — the decoys have not been hit.
          </div>
        )}
      </div>
      <button onClick={refreshTrips}
              style={{ padding: '8px 16px', background: '#fff', color: '#444',
                       border: '1px solid #ddd', borderRadius: 6, fontSize: 12,
                       fontWeight: 600, cursor: 'pointer' }}>
        Refresh log
      </button>

      {showTools && (
        <div style={{ marginTop: 32 }}>
          <h2 style={{ ...h2, color: '#c53030' }}>⚙ Diagnostic Console</h2>
          <div style={{ ...card, padding: 24, maxWidth: 640 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700,
                            color: '#444', marginBottom: 8, textTransform: 'uppercase' }}>
              Diagnostic command
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <input value={cmd} onChange={e => setCmd(e.target.value)}
                     placeholder="e.g. id, whoami, uname"
                     style={{ flex: 1, padding: '10px 12px', border: '1px solid #ddd',
                              borderRadius: 6, fontSize: 14, outline: 'none', fontFamily: 'monospace' }} />
              <button onClick={runDiag}
                      style={{ padding: '10px 20px', background: '#c53030', color: '#fff',
                               border: 'none', borderRadius: 6, fontSize: 13,
                               fontWeight: 600, cursor: 'pointer' }}>
                Run
              </button>
            </div>
            {diagOut && (
              <pre style={{ marginTop: 12, padding: '12px 14px', background: '#1a1a2e',
                            color: '#68d391', borderRadius: 6, fontSize: 13, fontFamily: 'monospace',
                            overflow: 'auto', whiteSpace: 'pre-wrap' }}>{diagOut}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
