import React from 'react';
import { TICKET_CATEGORIES, TICKET_PRIORITIES } from '../../utils/constants';

export default function TicketFilters({ filters, onFilterChange, onReset }) {
  return (
    <div
      className="card"
      style={{
        display: 'flex',
        gap: '0.85rem',
        flexWrap: 'wrap',
        alignItems: 'center',
        marginBottom: '1.5rem',
        padding: '1.1rem',
      }}
    >
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search by ticket #, subject, author name, or email..."
        value={filters.search || ''}
        onChange={(e) => onFilterChange('search', e.target.value)}
        style={{
          background: 'var(--bg-input)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-main)',
          padding: '0.55rem 0.8rem',
          borderRadius: 'var(--radius-sm)',
          flex: '2',
          minWidth: '220px',
        }}
      />

      {/* Status Filter */}
      <select
        value={filters.status || 'ALL'}
        onChange={(e) => onFilterChange('status', e.target.value)}
        style={{
          background: 'var(--bg-input)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-main)',
          padding: '0.55rem 0.8rem',
          borderRadius: 'var(--radius-sm)',
          flex: '1',
          minWidth: '130px',
        }}
      >
        <option value="ALL">All Statuses</option>
        <option value="Open">Open</option>
        <option value="In Progress">In Progress</option>
        <option value="Resolved">Resolved</option>
        <option value="Closed">Closed</option>
      </select>

      {/* Priority Filter */}
      <select
        value={filters.priority || 'ALL'}
        onChange={(e) => onFilterChange('priority', e.target.value)}
        style={{
          background: 'var(--bg-input)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-main)',
          padding: '0.55rem 0.8rem',
          borderRadius: 'var(--radius-sm)',
          flex: '1',
          minWidth: '130px',
        }}
      >
        <option value="ALL">All Priorities</option>
        {TICKET_PRIORITIES.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      {/* Category Filter */}
      <select
        value={filters.category || 'ALL'}
        onChange={(e) => onFilterChange('category', e.target.value)}
        style={{
          background: 'var(--bg-input)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-main)',
          padding: '0.55rem 0.8rem',
          borderRadius: 'var(--radius-sm)',
          flex: '1.5',
          minWidth: '180px',
        }}
      >
        <option value="ALL">All Categories</option>
        {TICKET_CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      {/* Reset Filter Button */}
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="btn-secondary"
          style={{ padding: '0.55rem 0.85rem', fontSize: '0.8rem' }}
        >
          Reset Filters
        </button>
      )}
    </div>
  );
}
