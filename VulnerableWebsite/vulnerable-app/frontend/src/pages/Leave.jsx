import React, { useState, useEffect, useCallback } from 'react';
import { api, auth } from '../api/client';
import { th, td, cardWrap, pageH1, input, label, btn, chip } from '../ui';

const STATUS_COLOR = { pending: '#f6ad55', approved: '#68d391', rejected: '#fc8181' };

const empty = { leave_type: 'annual', start_date: '', end_date: '', reason: '' };

export default function Leave() {
  const user = auth.getUser();
  const canDecide = user?.role === 'manager' || user?.role === 'admin';

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(empty);
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/leave')
      .then(r => setRows(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    setErr('');
    setSaving(true);
    try {
      await api.post('/leave', form);
      setForm(empty);
      load();
    } catch (e) {
      setErr(e.response?.data?.error || 'failed');
    } finally {
      setSaving(false);
    }
  };

  const decide = async (id, status) => {
    try {
      await api.patch(`/leave/${id}`, { status });
      load();
    } catch (e) {
      setErr(e.response?.data?.error || 'failed');
    }
  };

  return (
    <div>
      <h1 style={pageH1}>Leave Requests</h1>

      <div style={{ ...cardWrap, padding: 24, marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Request Leave</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <div>
            <label style={label}>Type</label>
            <select value={form.leave_type} onChange={e => setForm({ ...form, leave_type: e.target.value })}
                    style={{ ...input, width: '100%' }}>
              <option value="annual">annual</option>
              <option value="sick">sick</option>
              <option value="personal">personal</option>
              <option value="unpaid">unpaid</option>
            </select>
          </div>
          <div>
            <label style={label}>Start Date</label>
            <input type="date" value={form.start_date}
                   onChange={e => setForm({ ...form, start_date: e.target.value })}
                   style={{ ...input, width: '100%' }} />
          </div>
          <div>
            <label style={label}>End Date</label>
            <input type="date" value={form.end_date}
                   onChange={e => setForm({ ...form, end_date: e.target.value })}
                   style={{ ...input, width: '100%' }} />
          </div>
          <div>
            <label style={label}>Reason</label>
            <input value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}
                   style={{ ...input, width: '100%' }} />
          </div>
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={submit} disabled={saving} style={btn}>
            {saving ? 'Submitting…' : 'Submit Request'}
          </button>
          {err && <span style={{ color: '#fc8181', fontSize: 13 }}>{err}</span>}
        </div>
      </div>

      <div style={cardWrap}>
        {loading && <div style={{ padding: 16, color: '#888' }}>Loading…</div>}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Employee','Type','Start','End','Status','Actions'].map(h => (
                <th key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td style={{ ...td, fontWeight: 600 }}>{r.username}</td>
                <td style={td}>{r.leave_type}</td>
                <td style={{ ...td, color: '#888' }}>{new Date(r.start_date).toLocaleDateString()}</td>
                <td style={{ ...td, color: '#888' }}>{new Date(r.end_date).toLocaleDateString()}</td>
                <td style={td}><span style={chip(STATUS_COLOR[r.status])}>{r.status}</span></td>
                <td style={td}>
                  {canDecide && r.status === 'pending' ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => decide(r.id, 'approved')}
                              style={{ ...btn, background: '#68d391', padding: '5px 12px', fontSize: 12 }}>
                        Approve
                      </button>
                      <button onClick={() => decide(r.id, 'rejected')}
                              style={{ ...btn, background: '#fc8181', padding: '5px 12px', fontSize: 12 }}>
                        Reject
                      </button>
                    </div>
                  ) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && rows.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: '#aaa' }}>No leave requests</div>
        )}
      </div>
    </div>
  );
}
