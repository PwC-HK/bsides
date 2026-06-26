import React, { useState } from 'react';
import { api, auth } from '../api/client';
import { cardWrap, pageH1, input, label, btn } from '../ui';

export default function Profile() {
  const user = auth.getUser();
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [conf, setConf] = useState('');
  const [msg, setMsg] = useState('');

  const submit = async () => {
    setMsg('');
    if (next !== conf) {
      setMsg('Error: new password and confirmation do not match');
      return;
    }
    try {
      const r = await api.post('/auth/change-password', { current_password: cur, new_password: next });
      setMsg('Success: ' + (r.data?.message || 'password changed'));
      setCur(''); setNext(''); setConf('');
    } catch (e) {
      setMsg('Error: ' + (e.response?.data?.error || 'failed'));
    }
  };

  const row = { display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f0f2f5' };
  const k = { fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' };
  const v = { fontSize: 14, fontWeight: 600, color: '#1a1a2e' };

  return (
    <div>
      <h1 style={pageH1}>Profile</h1>

      <div style={{ ...cardWrap, padding: '8px 24px', marginBottom: 24, maxWidth: 520 }}>
        <div style={row}><span style={k}>Username</span><span style={v}>{user?.username}</span></div>
        <div style={row}><span style={k}>Role</span><span style={v}>{user?.role}</span></div>
        <div style={row}><span style={k}>User ID</span><span style={v}>{user?.id}</span></div>
        <div style={{ ...row, borderBottom: 'none' }}>
          <span style={k}>Token</span>
          <span style={{ ...v, color: '#888', fontWeight: 500, fontSize: 13 }}>Stored locally</span>
        </div>
      </div>

      <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Change Password</h2>
      <div style={{ ...cardWrap, padding: 24, maxWidth: 480 }}>
        <div style={{ marginBottom: 14 }}>
          <label style={label}>Current Password</label>
          <input type="password" value={cur} onChange={e => setCur(e.target.value)}
                 style={{ ...input, width: '100%' }} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={label}>New Password</label>
          <input type="password" value={next} onChange={e => setNext(e.target.value)}
                 style={{ ...input, width: '100%' }} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={label}>Confirm New Password</label>
          <input type="password" value={conf} onChange={e => setConf(e.target.value)}
                 style={{ ...input, width: '100%' }} />
        </div>
        <button onClick={submit} style={btn}>Update Password</button>
        {msg && (
          <div style={{
            marginTop: 12, padding: '10px 14px', borderRadius: 6, fontSize: 13,
            background: msg.startsWith('Success') ? '#f0fff4' : '#fff5f5',
            border: '1px solid ' + (msg.startsWith('Success') ? '#c6f6d5' : '#fed7d7'),
            color: msg.startsWith('Success') ? '#276749' : '#c53030'
          }}>
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}
