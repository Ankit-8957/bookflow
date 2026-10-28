import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Navbar from '../components/common/Navbar';

export default function AdminLayout() {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2rem', padding: '0 0.5rem' }}>
          BookLeaf <span style={{ color: 'var(--accent-purple)' }}>Admin</span>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <NavLink to="/admin/dashboard" style={({ isActive }) => ({ padding: '0.6rem 0.8rem', borderRadius: '6px', background: isActive ? 'var(--bg-card-hover)' : 'transparent', color: isActive ? 'var(--accent-purple)' : 'var(--text-main)', fontWeight: 600 })}>
            ⚡ Operations
          </NavLink>
          <NavLink to="/admin/tickets" style={({ isActive }) => ({ padding: '0.6rem 0.8rem', borderRadius: '6px', background: isActive ? 'var(--bg-card-hover)' : 'transparent', color: isActive ? 'var(--accent-purple)' : 'var(--text-main)', fontWeight: 600 })}>
            📥 Ticket Queue
          </NavLink>
        </nav>
      </aside>
      <div className="main-content">
        <Navbar title="Admin Operations" />
        <Outlet />
      </div>
    </div>
  );
}
