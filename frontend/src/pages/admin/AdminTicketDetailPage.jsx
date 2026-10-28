import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../hooks/useAuth';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import AiDraftPanel from '../../components/admin/AiDraftPanel';
import InternalNotesPanel from '../../components/admin/InternalNotesPanel';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { TICKET_CATEGORIES, TICKET_PRIORITIES } from '../../utils/constants';

export default function AdminTicketDetailPage() {
  const params = useParams();
  const ticketId = params.ticketId || params.id;
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [updatingField, setUpdatingField] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadTicket = async (isBackground = false) => {
    try {
      const data = await adminService.getTicketById(ticketId);
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

    // Near-real-time polling every 5 seconds
    const interval = setInterval(() => {
      loadTicket(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [ticketId]);

  const showTemporaryNotice = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3500);
  };

  // Status Change
  const handleStatusChange = async (newStatus) => {
    setUpdatingField(true);
    try {
      await adminService.updateTicketStatus(ticketId, newStatus);
      showTemporaryNotice(`Status updated to ${newStatus}`);
      await loadTicket(true);
    } catch (err) {
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdatingField(false);
    }
  };

  // Category Override
  const handleCategoryChange = async (newCategory) => {
    setUpdatingField(true);
    try {
      await adminService.updateTicketCategory(ticketId, newCategory);
      showTemporaryNotice(`Category updated to ${newCategory}`);
      await loadTicket(true);
    } catch (err) {
      alert(err.message || 'Failed to override category');
    } finally {
      setUpdatingField(false);
    }
  };

  // Priority Override
  const handlePriorityChange = async (newPriority) => {
    setUpdatingField(true);
    try {
      await adminService.updateTicketPriority(ticketId, newPriority);
      showTemporaryNotice(`Priority updated to ${newPriority}`);
      await loadTicket(true);
    } catch (err) {
      alert(err.message || 'Failed to override priority');
    } finally {
      setUpdatingField(false);
    }
  };

  // Assign to Me
  const handleAssignToMe = async () => {
    setUpdatingField(true);
    try {
      await adminService.assignTicket(ticketId);
      showTemporaryNotice('Ticket assigned to you');
      await loadTicket(true);
    } catch (err) {
      alert(err.message || 'Failed to assign ticket');
    } finally {
      setUpdatingField(false);
    }
  };

  // Add Internal Note
  const handleAddNote = async (noteText) => {
    try {
      await adminService.addInternalNote(ticketId, noteText);
      showTemporaryNotice('Internal note recorded');
      await loadTicket(true);
    } catch (err) {
      alert(err.message || 'Failed to add internal note');
    }
  };

  // Apply AI Draft into reply textarea
  const handleApplyDraft = (draftText) => {
    setReply(draftText);
    showTemporaryNotice('AI draft inserted into response field');
  };

  // Send Response to Author
  const handleSendResponse = async (e) => {
    e.preventDefault();
    if (!reply.trim() || sendingReply) return;

    setSendingReply(true);
    try {
      await adminService.sendReply(ticketId, reply.trim());
      setReply('');
      showTemporaryNotice('Response sent to author successfully');
      await loadTicket(true);
    } catch (err) {
      alert(err.message || 'Failed to send response');
    } finally {
      setSendingReply(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '3rem' }}>
        <LoadingSpinner />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading ticket workspace...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="page-container">
        <button onClick={() => navigate('/admin/tickets')} className="btn-secondary" style={{ marginBottom: '1.5rem' }}>
          ← Back to Queue
        </button>
        <div className="card" style={{ color: '#f87171' }}>
          {error || 'Ticket not found'}
        </div>
      </div>
    );
  }

  const isAssignedToMe = ticket.assignedTo?.userId && ticket.assignedTo?.userId.toString() === user?.id?.toString();

  return (
    <div className="page-container">
      {/* Top Bar Navigation & Notifications */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <button onClick={() => navigate('/admin/tickets')} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
          ← Back to Triage Queue
        </button>

        {notice && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
            ✓ {notice}
          </div>
        )}
      </div>

      {/* Ticket Overview Header Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                Ticket #{ticket.ticketNumber}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>•</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Author: <strong style={{ color: 'var(--text-main)' }}>{ticket.authorName}</strong> ({ticket.authorEmail})
              </span>
              {ticket.bookTitle && (
                <>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>•</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--primary-light, #818cf8)' }}>
                    📖 {ticket.bookTitle}
                  </span>
                </>
              )}
            </div>

            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.35rem' }}>
              {ticket.subject}
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
            {ticket.assignedTo?.name ? (
              <span style={{ fontSize: '0.75rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                Assigned: <strong>{ticket.assignedTo.name}</strong>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleAssignToMe}
                disabled={updatingField}
                className="btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
              >
                Assign to Me
              </button>
            )}
          </div>
        </div>

        {/* Triage & Override Controls Bar */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', fontSize: '0.85rem' }}>
          {/* Status Control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Status:</span>
            <select
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updatingField}
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem' }}
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Category Override Control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Category:</span>
            <select
              value={ticket.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              disabled={updatingField}
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem' }}
            >
              {TICKET_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Priority Override Control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Priority:</span>
            <select
              value={ticket.priority}
              onChange={(e) => handlePriorityChange(e.target.value)}
              disabled={updatingField}
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem' }}
            >
              {TICKET_PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* AI Prediction Audit Trail */}
        {(ticket.aiCategory || ticket.aiPriority) && (
          <div style={{ marginTop: '1rem', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.85rem', fontSize: '0.8rem', color: '#c7d2fe', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span>🤖 <strong>AI Triage Prediction:</strong> Original Category: <em>{ticket.aiCategory || 'N/A'}</em> • Original Priority: <em>{ticket.aiPriority || 'N/A'}</em></span>
              {ticket.aiReason && <div style={{ fontSize: '0.75rem', color: '#a5b4fc', marginTop: '0.2rem' }}>Rationale: {ticket.aiReason}</div>}
            </div>
            {(ticket.category !== ticket.aiCategory || ticket.priority !== ticket.aiPriority) && (
              <span style={{ fontSize: '0.7rem', color: '#fbbf24', background: 'rgba(245, 158, 11, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                ✍️ Admin Override Applied
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Grid: Left = Conversation & Response; Right = AI Draft & Internal Notes */}
      <div className="ticket-detail-grid">
        {/* Left Column: Messages & Reply */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Inquiry Thread</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {ticket.messages?.length || 0} messages recorded
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '260px' }}>
              {ticket.messages && ticket.messages.map((m, idx) => {
                const isAdmin = m.senderRole === 'ADMIN';
                return (
                  <div
                    key={idx}
                    style={{
                      alignSelf: isAdmin ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      background: isAdmin ? 'var(--primary, #4f46e5)' : 'var(--bg-input, #1e293b)',
                      color: 'var(--text-main)',
                      padding: '0.85rem 1.1rem',
                      borderRadius: 'var(--radius-md)',
                      border: isAdmin ? '1px solid transparent' : '1px solid var(--border-color)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', color: isAdmin ? 'rgba(255,255,255,0.85)' : 'var(--accent-purple, #a78bfa)', marginBottom: '0.35rem', fontWeight: 600 }}>
                      {isAdmin ? `BookLeaf Specialist (${m.senderName || 'Staff'})` : ticket.authorName} •{' '}
                      {new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5, fontSize: '0.9rem' }}>
                      {m.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Official Response Composer */}
            <form onSubmit={handleSendResponse} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  Compose Official Support Response:
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Visible directly to author
                </span>
              </div>

              <textarea
                rows={6}
                placeholder="Draft or paste verified support response to the author..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '0.75rem 0.9rem', borderRadius: 'var(--radius-sm)', lineHeight: 1.5, fontSize: '0.875rem' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="submit"
                  disabled={sendingReply || !reply.trim()}
                  className="btn-primary"
                  style={{ minWidth: '160px', padding: '0.65rem 1.25rem' }}
                >
                  {sendingReply ? 'Sending Response...' : 'Send Official Response'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: AI Assistant Draft & Internal Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <AiDraftPanel ticketId={ticketId} onApplyDraft={handleApplyDraft} />
          <InternalNotesPanel notes={ticket.internalNotes || []} onAddNote={handleAddNote} />
        </div>
      </div>
    </div>
  );
}
