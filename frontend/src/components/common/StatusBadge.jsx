import React from 'react';

export default function StatusBadge({ status }) {
  const s = status || 'Open';
  const normalized = s.toLowerCase().replace(/[^a-z]/g, '');

  const config = {
    open: { label: 'Open', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
    inprogress: { label: 'In Progress', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
    resolved: { label: 'Resolved', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
    closed: { label: 'Closed', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)' },
  };

  const item = config[normalized] || config.open;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: '0.75rem',
        fontWeight: 600,
        color: item.color,
        background: item.bg,
        padding: '0.2rem 0.55rem',
        borderRadius: '9999px',
        border: `1px solid ${item.color}33`,
      }}
    >
      {item.label}
    </span>
  );
}
