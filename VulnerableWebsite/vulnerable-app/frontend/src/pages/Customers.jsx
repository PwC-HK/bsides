import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { th, td, cardWrap, pageH1, input, label, btn, chip } from '../ui';

const STATUS_COLOR = { active: '#68d391', prospect: '#4fc3f7', inactive: '#fc8181' };

const empty = { name: '', company: '', email: '', phone: '', status: 'prospect', credit_limit: '' };

export default function Customers() {
  const [search, setSearch] = useState('');
  const [rows, setRows]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback((q) => {
    setLoading(true);
    api.get('/customers', { params: { search: q } })
      .then(r => setRows(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(search), 300);
    return () => clearTimeout(t);
  }, [search, load]);

  const submit = async () => {
    setErr('');
    setSaving(true);
    try {
      await api.post('/customers', form);
      setForm(empty);
      setShowForm(false);
      load(search);
    } catch (e) {
      setErr(e.response?.data?.error || 'failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 style={pageH1}>Customers</h1>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center' }}>
        <input
          placeholder="Search customers…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...input, width: 320 }}
        />
        <button onClick={() => setShowForm(s => !s)} style={btn}>
          {showForm ? 'Close' : 'New Customer'}
        </button>
      </div>

      {showForm && (
        <div style={{ ...cardWrap, padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <div>
              <label style={label}>Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                     style={{ ...input, width: '100%' }} />
            </div>
            <div>
              <label style={label}>Company</label>
              <input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })}
                     style={{ ...input, width: '100%' }} />
            </div>
            <div>
              <label style={label}>Email</label>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                     style={{ ...input, width: '100%' }} />
            </div>
            <div>
              <label style={label}>Phone</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                     style={{ ...input, width: '100%' }} />
            </div>
            <div>
              <label style={label}>Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                      style={{ ...input, width: '100%' }}>
                <option value="active">active</option>
                <option value="prospect">prospect</option>
                <option value="inactive">inactive</option>
              </select>
            </div>
            <div>
              <label style={label}>Credit Limit</label>
              <input value={form.credit_limit} onChange={e => setForm({ ...form, credit_limit: e.target.value })}
                     type="number" style={{ ...input, width: '100%' }} />
            </div>
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={submit} disabled={saving} style={btn}>
              {saving ? 'Saving…' : 'Create Customer'}
            </button>
            {err && <span style={{ color: '#fc8181', fontSize: 13 }}>{err}</span>}
          </div>
        </div>
      )}

      <div style={cardWrap}>
        {loading && <div style={{ padding: 16, color: '#888' }}>Loading…</div>}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['Name','Company','Email','Phone','Status','Credit Limit'].map(h => (
              <th key={h} style={th}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td style={{ ...td, fontWeight: 600 }}>{r.name}</td>
                <td style={td}>{r.company}</td>
                <td style={td}>{r.email}</td>
                <td style={td}>{r.phone}</td>
                <td style={td}><span style={chip(STATUS_COLOR[r.status])}>{r.status}</span></td>
                <td style={td}>${parseFloat(r.credit_limit || 0).toLocaleString()}</td>
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
