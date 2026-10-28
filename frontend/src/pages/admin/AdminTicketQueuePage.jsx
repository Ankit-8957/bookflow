import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import TicketFilters from '../../components/admin/TicketFilters';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminTicketQueuePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    search: '',
    status: searchParams.get('status') || 'ALL',
    priority: searchParams.get('priority') || 'ALL',
    category: 'ALL',
  });

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const s = searchParams.get('status');
    const p = searchParams.get('priority');
    if (s || p) {
      setFilters((prev) => ({
        ...prev,
        status: s || prev.status,
        priority: p || prev.priority,
      }));
    }
  }, [searchParams]);

  const loadQueue = async (isBackground = false) => {
    try {
      const data = await adminService.getAllTickets(filters);
      setTickets(data || []);
      if (!isBackground) setLoading(false);
    } catch (err) {
      if (!isBackground) {
        setError(err.message || 'Failed to load ticket queue');
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadQueue(false);

    // Polling every 7 seconds for new tickets in queue
    const interval = setInterval(() => {
      loadQueue(true);
    }, 7000);

    return () => clearInterval(interval);
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({
      search: '',
      status: 'ALL',
      priority: 'ALL',
      category: 'ALL',
    });
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Operations Triage Queue</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Filter, triage, AI-classify, and resolve incoming author inquiries.
          </p>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'var(--bg-input)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          Showing <strong>{tickets.length}</strong> active tickets (Critical first)
        </div>
      </div>

      <TicketFilters filters={filters} onFilterChange={handleFilterChange} onReset={handleReset} />

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <LoadingSpinner />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading queue tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎉</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Zero Tickets Match Filter</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem', marginBottom: '1rem' }}>
            There are no author support tickets matching the current filter criteria.
          </p>
          <button onClick={handleReset} className="btn-secondary">
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <tr>
                  <th style={{ padding: '0.85rem 1rem' }}>Ticket</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Author</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Subject & Context</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Priority</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Submitted</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr
                    key={t._id || t.ticketNumber}
                    onClick={() => navigate(`/admin/tickets/${t._id || t.ticketNumber}`)}
                    style={{ cursor: 'pointer', borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s ease' }}
                    className="table-row-hover"
                  >
                    <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--primary-light, #818cf8)' }}>
                      #{t.ticketNumber}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600 }}>{t.authorName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.authorEmail}</div>
                    </td>
                    <td style={{ padding: '1rem', maxWidth: '280px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {t.subject}
                      </div>
                      {t.bookTitle && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          📖 {t.bookTitle}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <StatusBadge status={t.status} />
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {t.category}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/tickets/${t._id || t.ticketNumber}`);
                        }}
                        className="btn-secondary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                      >
                        Open Triage →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
