import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import PriorityBadge from '../common/PriorityBadge';

export default function TicketRow({ ticket }) {
  const navigate = useNavigate();
  const ticketId = ticket._id || ticket.ticketNumber || ticket.id;

  return (
    <tr
      onClick={() => navigate(`/author/tickets/${ticketId}`)}
      style={{
        cursor: 'pointer',
        borderBottom: '1px solid var(--border-color)',
        transition: 'background 0.15s ease',
      }}
      className="table-row-hover"
    >
      <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--primary-light, #818cf8)' }}>
        #{ticket.ticketNumber || ticket.id}
      </td>
      <td style={{ padding: '1rem' }}>
        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{ticket.subject}</div>
        {ticket.bookTitle && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            📖 {ticket.bookTitle}
          </div>
        )}
      </td>
      <td style={{ padding: '1rem' }}>
        <StatusBadge status={ticket.status} />
      </td>
      <td style={{ padding: '1rem' }}>
        <PriorityBadge priority={ticket.priority} />
      </td>
      <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        {ticket.category || 'General Inquiry'}
      </td>
      <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        {new Date(ticket.createdAt || Date.now()).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </td>
    </tr>
  );
}
