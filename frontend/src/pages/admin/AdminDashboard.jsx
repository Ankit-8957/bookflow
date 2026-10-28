import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await adminService.getDashboardMetrics();
        setMetrics(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch operational metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: '3rem' }}>
        <LoadingSpinner />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading support metrics...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Publishing Support Operations</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Real-time author inquiry triage, AI categorization, and SLA tracking dashboard.
          </p>
        </div>
        <Link to="/admin/tickets" className="btn-primary">
          View Ticket Queue →
        </Link>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/tickets?status=Open')}>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Open Inquiries</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#3b82f6', marginTop: '0.2rem' }}>
              {metrics?.openTickets ?? 0}
            </div>
          </div>
        </div>

        <div className="metric-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/tickets?priority=Critical')}>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Critical / High Priority</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ef4444', marginTop: '0.2rem' }}>
              {metrics?.criticalHighTickets ?? 0}
            </div>
          </div>
        </div>

        <div className="metric-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/tickets?status=In Progress')}>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>In Progress</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.2rem' }}>
              {metrics?.inProgressTickets ?? 0}
            </div>
          </div>
        </div>

        <div className="metric-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/tickets?status=Resolved')}>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Resolved</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#10b981', marginTop: '0.2rem' }}>
              {metrics?.resolvedTickets ?? 0}
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Unassigned Tickets</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: (metrics?.unassignedTickets ?? 0) > 0 ? '#f59e0b' : 'var(--text-muted)', marginTop: '0.2rem' }}>
              {metrics?.unassignedTickets ?? 0}
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Tickets Processed</div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.2rem' }}>
              {metrics?.totalTickets ?? 0}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Queue Banner */}
      <div className="card" style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(15, 23, 42, 0.6))' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>⚡ Operations Triage Queue</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Tickets are ranked with Critical & High priority items prioritized at the top of the queue.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => navigate('/admin/tickets?priority=Critical')} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
            Filter Critical Only
          </button>
          <button onClick={() => navigate('/admin/tickets')} className="btn-primary" style={{ fontSize: '0.85rem' }}>
            Open Triage Queue
          </button>
        </div>
      </div>
    </div>
  );
}
