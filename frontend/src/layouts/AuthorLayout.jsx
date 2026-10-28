import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Navbar from '../components/common/Navbar';

export default function AuthorLayout() {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2rem', padding: '0 0.5rem' }}>
          BookLeaf <span style={{ color: 'var(--primary)' }}>Author</span>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <NavLink to="/author/dashboard" style={({ isActive }) => ({ padding: '0.6rem 0.8rem', borderRadius: '6px', background: isActive ? 'var(--bg-card-hover)' : 'transparent', color: isActive ? 'var(--primary)' : 'var(--text-main)', fontWeight: 600 })}>
            📊 Dashboard
          </NavLink>
          <NavLink to="/author/books" style={({ isActive }) => ({ padding: '0.6rem 0.8rem', borderRadius: '6px', background: isActive ? 'var(--bg-card-hover)' : 'transparent', color: isActive ? 'var(--primary)' : 'var(--text-main)', fontWeight: 600 })}>
            📚 My Books
          </NavLink>
          <NavLink to="/author/tickets" style={({ isActive }) => ({ padding: '0.6rem 0.8rem', borderRadius: '6px', background: isActive ? 'var(--bg-card-hover)' : 'transparent', color: isActive ? 'var(--primary)' : 'var(--text-main)', fontWeight: 600 })}>
            🎫 Support Tickets
          </NavLink>
        </nav>
      </aside>
      <div className="main-content">
        <Navbar title="Author Workspace" />
        <Outlet />
      </div>
    </div>
  );
}
