import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { authorService } from '../../services/authorService';
import TicketRow from '../../components/author/TicketRow';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTickets = async (isBackground = false) => {
    try {
      const data = await authorService.getTickets();
      setTickets(data || []);
      if (!isBackground) setLoading(false);
    } catch (err) {
      if (!isBackground) {
        setError(err.message || 'Failed to load tickets');
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadTickets(false);

    // Near-real-time polling every 6 seconds while author is on this page
    const interval = setInterval(() => {
      loadTickets(true);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>My Support Inquiries</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Track the real-time status and specialist responses for all your queries.
          </p>
        </div>
        <Link to="/author/tickets/create" className="btn-primary">
          + Create New Ticket
        </Link>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <LoadingSpinner />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading your tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎫</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>No Support Tickets</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem', marginBottom: '1.5rem' }}>
            You haven't submitted any support requests yet.
          </p>
          <Link to="/author/tickets/create" className="btn-primary">
            Submit Your First Query
          </Link>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <tr>
                  <th style={{ padding: '0.85rem 1rem' }}>Ticket ID</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Subject</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Priority</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <TicketRow key={ticket._id || ticket.ticketNumber} ticket={ticket} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
