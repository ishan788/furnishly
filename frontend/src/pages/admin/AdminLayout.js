import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: '▦', end: true },
  { to: '/admin/products', label: 'Products', icon: '⬡' },
  { to: '/admin/orders', label: 'Orders', icon: '◫' },
  { to: '/admin/users', label: 'Users', icon: '◎' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => { await logout(); navigate('/'); };

  return (
    <div className={`admin-layout ${collapsed ? 'admin-layout--collapsed' : ''}`}>
      <aside className="admin-sidebar">
        <div className="admin-sidebar__header">
          {!collapsed && <span className="admin-sidebar__logo">FURNISHLY</span>}
          <button className="admin-sidebar__toggle" onClick={() => setCollapsed(v => !v)}>
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {!collapsed && (
          <div className="admin-sidebar__user">
            <div className="admin-sidebar__avatar">{user?.name?.charAt(0)}</div>
            <div>
              <p className="admin-sidebar__name">{user?.name}</p>
              <p className="admin-sidebar__role">Administrator</p>
            </div>
          </div>
        )}

        <nav className="admin-sidebar__nav">
          {NAV.map(({ to, label, icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `admin-nav-item ${isActive ? 'admin-nav-item--active' : ''}`}>
              <span className="admin-nav-icon">{icon}</span>
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <NavLink to="/" className="admin-nav-item" style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
            <span className="admin-nav-icon">↗</span>
            {!collapsed && <span>View Store</span>}
          </NavLink>
          <button className="admin-nav-item admin-nav-item--logout" onClick={handleLogout}>
            <span className="admin-nav-icon">⏻</span>
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
