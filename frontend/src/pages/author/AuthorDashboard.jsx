import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { authorService } from '../../services/authorService';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AuthorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await authorService.getDashboardStats();
        setStats(data);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: '3rem' }}>
        <LoadingSpinner />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Welcome back, {user?.name || 'Author'}! 👋</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            BookLeaf Author Hub • {user?.email} {user?.city ? `(${user.city})` : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/author/books" className="btn-secondary">
            View Books
          </Link>
          <Link to="/author/tickets/create" className="btn-primary">
            + Raise Support Ticket
          </Link>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Primary KPI Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Published Books</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.2rem' }}>
              {stats?.publishedBooksCount ?? 0}
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Sales Units</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.2rem' }}>
              {(stats?.totalCopiesSold ?? 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Royalties Earned</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#10b981', marginTop: '0.2rem' }}>
              ₹{(stats?.totalRoyaltyEarned ?? 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pending Royalties</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: (stats?.royaltyPending ?? 0) > 0 ? '#f59e0b' : 'var(--text-muted)', marginTop: '0.2rem' }}>
              ₹{(stats?.royaltyPending ?? 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active Inquiries</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.2rem' }}>
              {stats?.activeTicketsCount ?? 0}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '2.5rem' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>📖 My Book Inventory</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Review sales breakdown per title, ISBN allocations, retail channel distribution, and quarterly royalties.
          </p>
          <Link to="/author/books" className="btn-secondary" style={{ alignSelf: 'flex-start', marginTop: 'auto' }}>
            Browse My Books →
          </Link>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>💬 Author Support Tickets</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Track your open queries, royalty checks, printing replacements, and responses from BookLeaf specialists.
          </p>
          <Link to="/author/tickets" className="btn-secondary" style={{ alignSelf: 'flex-start', marginTop: 'auto' }}>
            View Ticket Thread →
          </Link>
        </div>
      </div>
    </div>
  );
}
