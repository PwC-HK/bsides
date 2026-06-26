import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, auth } from '../api/client';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const r = await api.post('/auth/login', { username, password });
      auth.setToken(r.data.token);
      navigate('/dashboard');
    } catch {
      setError('Invalid username or password');
    } finally { setLoading(false); }
  };

  const wrap  = { minHeight: '100vh', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', background: '#f0f2f5' };
  const card  = { background: '#fff', borderRadius: 12, padding: '40px 36px',
                  width: 380, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' };
  const title = { fontSize: 22, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 };
  const sub   = { fontSize: 13, color: '#888', marginBottom: 28 };
  const label = { display: 'block', fontSize: 12, fontWeight: 600,
                  color: '#444', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' };
  const input = { width: '100%', padding: '10px 12px', border: '1px solid #ddd',
                  borderRadius: 6, fontSize: 14, outline: 'none', marginBottom: 18 };
  const btn   = { width: '100%', padding: '11px', background: '#1a1a2e', color: '#fff',
                  border: 'none', borderRadius: 6, fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', marginTop: 4 };

  return (
    <div style={wrap}>
      <div style={card}>
        <div style={{ fontSize: 28, marginBottom: 12 }}>⬡</div>
        <div style={title}>darklab ERP</div>
        <div style={sub}>Enterprise Resource Planning</div>
        <form onSubmit={handle}>
          <label style={label}>Username</label>
          <input style={input} value={username} onChange={e => setUsername(e.target.value)}
                 autoFocus required />
          <label style={label}>Password</label>
          <input style={input} type="password" value={password}
                 onChange={e => setPassword(e.target.value)} required />
          {error && <div style={{ color: '#e53e3e', fontSize: 13, marginBottom: 12 }}>{error}</div>}
          <button style={btn} type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
