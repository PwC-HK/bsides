import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { auth } from './api/client';
import Login         from './pages/Login';
import Dashboard     from './pages/Dashboard';
import PurchaseOrders from './pages/PurchaseOrders';
import Customers     from './pages/Customers';
import Invoices      from './pages/Invoices';
import Inventory     from './pages/Inventory';
import Employees     from './pages/Employees';
import Departments   from './pages/Departments';
import Leave         from './pages/Leave';
import Admin         from './pages/Admin';
import Profile       from './pages/Profile';

const sidebarStyle = {
  width: 220, minHeight: '100vh', background: '#1a1a2e', color: '#fff',
  display: 'flex', flexDirection: 'column', padding: '0',
  position: 'fixed', top: 0, left: 0
};
const logoStyle = {
  padding: '24px 20px', fontSize: 18, fontWeight: 700,
  borderBottom: '1px solid rgba(255,255,255,0.1)', letterSpacing: '-0.5px'
};
const navStyle = { padding: '16px 0', flex: 1 };
const linkStyle = {
  display: 'block', padding: '10px 20px', color: 'rgba(255,255,255,0.7)',
  textDecoration: 'none', fontSize: 14, borderLeft: '3px solid transparent',
  transition: 'all 0.15s'
};
const activeStyle = { ...linkStyle, color: '#fff', background: 'rgba(255,255,255,0.08)', borderLeftColor: '#4fc3f7' };
const mainStyle = { marginLeft: 220, padding: 32, minHeight: '100vh' };

function Layout() {
  const navigate  = useNavigate();
  const user      = auth.getUser();
  const handleOut = () => { auth.clearToken(); navigate('/login'); };
  return (
    <div style={{ display: 'flex' }}>
      <div style={sidebarStyle}>
        <div style={logoStyle}>⬡ darklab ERP</div>
        <nav style={navStyle}>
          {[
            { to: '/dashboard',       label: 'Dashboard' },
            { to: '/purchase-orders', label: 'Purchase Orders' },
            { to: '/customers',       label: 'Customers' },
            { to: '/invoices',        label: 'Invoices' },
            { to: '/inventory',       label: 'Inventory' },
            { to: '/employees',       label: 'Employees' },
            { to: '/departments',     label: 'Departments' },
            { to: '/leave',           label: 'Leave Requests' },
          ].map(({ to, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => isActive ? activeStyle : linkStyle}>
              {label}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <NavLink to="/admin" style={({ isActive }) => isActive ? activeStyle : linkStyle}>
              Admin Panel
            </NavLink>
          )}
          <NavLink to="/profile" style={({ isActive }) => isActive ? activeStyle : linkStyle}>
            Profile
          </NavLink>
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
            {user?.username} · {user?.role}
          </div>
          <button onClick={handleOut}
            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)',
                     color: 'rgba(255,255,255,0.6)', padding: '6px 12px',
                     borderRadius: 4, cursor: 'pointer', fontSize: 12, width: '100%' }}>
            Sign out
          </button>
        </div>
      </div>
      <main style={mainStyle}>
        <Routes>
          <Route path="/dashboard"       element={<Dashboard />} />
          <Route path="/purchase-orders" element={<PurchaseOrders />} />
          <Route path="/customers"       element={<Customers />} />
          <Route path="/invoices"        element={<Invoices />} />
          <Route path="/inventory"       element={<Inventory />} />
          <Route path="/employees"       element={<Employees />} />
          <Route path="/departments"     element={<Departments />} />
          <Route path="/leave"           element={<Leave />} />
          <Route path="/admin"           element={<Admin />} />
          <Route path="/profile"         element={<Profile />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
    </div>
  );
}

function Guard({ children }) {
  return auth.getToken() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<Guard><Layout /></Guard>} />
      </Routes>
    </BrowserRouter>
  );
}
