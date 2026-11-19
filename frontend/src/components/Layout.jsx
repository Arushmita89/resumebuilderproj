import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { initials } from '../format';
import Icon from './Icon';
import { Initials } from './ui';

const NAV = [
  { to: '/', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/resumes', label: 'My Resumes', icon: 'file' },
  { to: '/templates', label: 'Templates', icon: 'layout' },
  { to: '/analysis', label: 'Resume Analysis', icon: 'chart' },
  { to: '/history', label: 'Analysis History', icon: 'history' },
  { to: '/profile', label: 'Profile', icon: 'user' }
];

export function BrandMark({ size = 28 }) {
  return (
    <span className="brand-mark" style={{ width: size, height: size }}>
      <Icon name="file" size={Math.round(size * 0.55)} strokeWidth={1.9} />
    </span>
  );
}

export default function Layout({ breadcrumb, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);

  function handleLogout() {
    setSigningOut(true);
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <BrandMark />
          <span className="brand-name">
            Resume<span>Builder</span>
          </span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-label">Menu</div>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon name={item.icon} size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            type="button"
            className="nav-item"
            onClick={handleLogout}
            disabled={signingOut}
            style={{ width: '100%', border: 0, background: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <Icon name="logout" size={16} />
            Logout
          </button>
          <div className="sidebar-user" style={{ marginTop: 8 }}>
            <Initials name={user?.fullName || ''} />
            <div style={{ minWidth: 0 }}>
              <div className="sidebar-user-name">{user?.fullName || 'User'}</div>
              <div className="sidebar-user-email">{user?.email || ''}</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            {title ? <strong style={{ fontSize: 14 }}>{title}</strong> : null}
            {breadcrumb ? <span className="topbar-breadcrumb">{breadcrumb}</span> : null}
          </div>
          <div className="topbar-right">
            <span className="badge badge-gray">
              <Icon name="shield" size={12} />
              Rule-based analysis
            </span>
          </div>
        </header>

        <Outlet context={{ user }} />
      </div>
    </div>
  );
}