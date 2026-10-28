import React from 'react';

export default function PriorityBadge({ priority }) {
  const p = priority || 'Medium';
  const normalized = p.toLowerCase();

  const config = {
    critical: { label: 'Critical', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
    high: { label: 'High', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
    medium: { label: 'Medium', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
    low: { label: 'Low', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
  };

  const item = config[normalized] || config.medium;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        fontSize: '0.75rem',
        fontWeight: 600,
        color: item.color,
        background: item.bg,
        padding: '0.2rem 0.55rem',
        borderRadius: '9999px',
        border: `1px solid ${item.color}33`,
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: item.color,
        }}
      />
      {item.label}
    </span>
  );
}
