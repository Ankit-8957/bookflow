import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authorService } from '../../services/authorService';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AuthorTicketDetailPage() {
  const params = useParams();
  const ticketId = params.ticketId || params.id;
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const loadTicket = async (isBackground = false) => {
    try {
      const data = await authorService.getTicketById(ticketId);
      setTicket(data);
      if (!isBackground) setLoading(false);
    } catch (err) {
      if (!isBackground) {
        setError(err.message || 'Failed to load ticket details');
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadTicket(false);

    // Near-real-time polling every 5 seconds so author receives replies without refreshing
    const interval = setInterval(() => {
      loadTicket(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [ticketId]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!reply.trim() || sending) return;

    setSending(true);
    try {
      await authorService.sendMessage(ticketId, reply.trim());
      setReply('');
      await loadTicket(true);
    } catch (err) {
      alert(err.message || 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '3rem' }}>
        <LoadingSpinner />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading inquiry conversation...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="page-container">
        <button onClick={() => navigate('/author/tickets')} className="btn-secondary" style={{ marginBottom: '1.5rem' }}>
          ← Back to Inquiries
        </button>
        <div className="card" style={{ color: '#f87171' }}>
          {error || 'Ticket not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '900px' }}>
      <button onClick={() => navigate('/author/tickets')} className="btn-secondary" style={{ marginBottom: '1.5rem', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
        ← Back to Inquiries
      </button>

      {/* Ticket Header Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Ticket #{ticket.ticketNumber || ticket.id}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>•</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ticket.category}</span>
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: '0.25rem' }}>
              {ticket.subject}
            </h1>
            {ticket.bookTitle && (
              <div style={{ fontSize: '0.85rem', color: 'var(--primary-light, #818cf8)', marginTop: '0.25rem' }}>
                📖 Associated Book: {ticket.bookTitle} {ticket.bookId ? `(ID: ${ticket.bookId})` : ''}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Conversation Thread</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            ⚡ Auto-sync active (updates automatically)
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '260px' }}>
          {ticket.messages && ticket.messages.map((m, idx) => {
            const isAuthor = m.senderRole === 'AUTHOR';
            return (
              <div
                key={idx}
                style={{
                  alignSelf: isAuthor ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: isAuthor ? 'var(--primary, #4f46e5)' : 'var(--bg-input, #1e293b)',
                  color: 'var(--text-main)',
                  padding: '0.85rem 1.1rem',
                  borderRadius: 'var(--radius-md)',
                  border: isAuthor ? '1px solid transparent' : '1px solid var(--border-color)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: isAuthor ? 'rgba(255,255,255,0.8)' : 'var(--accent-purple, #a78bfa)', marginBottom: '0.35rem', fontWeight: 600 }}>
                  {isAuthor ? 'You' : `BookLeaf Support Specialist (${m.senderName || 'Team'})`} •{' '}
                  {new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5, fontSize: '0.9rem' }}>
                  {m.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Reply Box */}
        <form onSubmit={handleSendReply} style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <input
            type="text"
            placeholder="Type follow-up query or reply here..."
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            disabled={sending}
            style={{ flex: 1, background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)' }}
          />
          <button type="submit" disabled={sending || !reply.trim()} className="btn-primary" style={{ minWidth: '90px' }}>
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
