import React, { useState } from 'react';

export default function InternalNotesPanel({ notes = [], onAddNote, loading = false }) {
  const [noteText, setNoteText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!noteText.trim() || loading) return;
    onAddNote(noteText.trim());
    setNoteText('');
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-amber, #fbbf24)' }}>
          🔒 Internal Staff Notes
        </h4>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'rgba(245, 158, 11, 0.1)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
          Staff Eyes Only
        </span>
      </div>

      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        Private coordination notes for editorial and distribution staff. Never exposed to authors.
      </p>

      <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {notes.length === 0 ? (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
            No internal staff notes on this ticket yet.
          </div>
        ) : (
          notes.map((n, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(245, 158, 11, 0.08)',
                borderLeft: '3px solid var(--accent-amber, #f59e0b)',
                padding: '0.6rem 0.8rem',
                borderRadius: '0 4px 4px 0',
                fontSize: '0.8rem',
              }}
            >
              <div style={{ color: 'var(--text-main)', lineHeight: 1.4 }}>{n.note}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                👤 {n.adminName || 'Admin'} •{' '}
                {new Date(n.createdAt || Date.now()).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        <input
          type="text"
          placeholder="Add private staff note..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          disabled={loading}
          style={{
            flex: 1,
            background: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            padding: '0.5rem 0.75rem',
            fontSize: '0.8rem',
            borderRadius: 'var(--radius-sm)',
          }}
        />
        <button
          type="submit"
          disabled={loading || !noteText.trim()}
          className="btn-secondary"
          style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem' }}
        >
          {loading ? 'Adding...' : 'Post Note'}
        </button>
      </form>
    </div>
  );
}
