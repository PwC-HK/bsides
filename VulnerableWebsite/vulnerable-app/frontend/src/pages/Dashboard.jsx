import React, { useEffect, useState } from 'react';
import { api, auth } from '../api/client';
import { cardWrap } from '../ui';
import {
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: '#fff', borderRadius: 10, padding: '24px 28px',
                  flex: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: 12, color: '#888', textTransform: 'uppercase',
                    letterSpacing: '0.08em', marginBottom: 10 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color: '#1a1a2e' }}>{value}</div>
    </div>
  );
}

const PO_COLOR = { pending: '#f6ad55', approved: '#68d391', rejected: '#fc8181' };
const ACT_COLOR = { invoice: '#4fc3f7', purchase_order: '#f6ad55', leave: '#b794f4' };

const money = (n) => '$' + Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });

export default function Dashboard() {
  const user = auth.getUser();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/dashboard')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: '#888' }}>Loading…</div>;
  if (!data) return null;

  const k = data.kpis || {};
  const revenueSeries = data.revenueSeries || [];
  const poStatus = data.poStatus || [];
  const headcountByDept = data.headcountByDept || [];
  const activity = data.activity || [];

  const chartTitle = { fontSize: 15, fontWeight: 700, margin: '16px 20px' };
  const chartCard = { ...cardWrap, flex: 1, minWidth: 320 };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Welcome back, {user?.username}</h1>
        <p style={{ color: '#888', marginTop: 4 }}>Here's what's happening across the business.</p>
      </div>

      <div style={{ display: 'flex', gap: 20, marginBottom: 32, flexWrap: 'wrap' }}>
        <StatCard label="Monthly Revenue" value={money(k.totalRevenue)} color="#68d391" />
        <StatCard label="Outstanding"     value={money(k.outstandingAmount)} color="#f6ad55" />
        <StatCard label="Low Stock"       value={k.lowStockCount} color="#fc8181" />
        <StatCard label="Pending Leave"   value={k.pendingLeave} color="#4fc3f7" />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginBottom: 32 }}>
        <div style={{ ...chartCard, minWidth: 520 }}>
          <h2 style={chartTitle}>Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueSeries} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <defs>
                <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4fc3f7" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#4fc3f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#888' }} />
              <YAxis tick={{ fontSize: 12, fill: '#888' }} />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#4fc3f7" fill="url(#revFill)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={chartCard}>
          <h2 style={chartTitle}>Purchase Order Status</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={poStatus} dataKey="value" nameKey="name" outerRadius={70} label>
                {poStatus.map((entry, i) => (
                  <Cell key={i} fill={PO_COLOR[entry.name] || '#ccc'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{ ...chartCard, minWidth: 520 }}>
          <h2 style={chartTitle}>Headcount by Department</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={headcountByDept} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#888' }} />
              <YAxis tick={{ fontSize: 12, fill: '#888' }} />
              <Tooltip />
              <Bar dataKey="value" fill="#1a1a2e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={cardWrap}>
        <h2 style={chartTitle}>Recent Activity</h2>
        {activity.length === 0 ? (
          <div style={{ padding: 24, color: '#aaa', textAlign: 'center' }}>No recent activity</div>
        ) : (
          <div style={{ padding: '0 20px 16px' }}>
            {activity.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: ACT_COLOR[a.type] || '#ccc', flexShrink: 0 }} />
                <span style={{ fontSize: 13, flex: 1 }}>{a.label}</span>
                <span style={{ fontSize: 12, color: '#888' }}>
                  {a.date ? new Date(a.date).toLocaleDateString() : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
