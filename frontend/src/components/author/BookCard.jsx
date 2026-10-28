import React from 'react';
import StatusBadge from '../common/StatusBadge';

export default function BookCard({ book }) {
  const isPendingPayout = (book.royaltyPending || 0) > 0;
  const isZeroRoyalty = (book.totalRoyaltyEarned || 0) === 0;
  const isProduction = !(book.status || '').toLowerCase().includes('published');

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {book.genre || 'General'}
          </span>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '0.15rem', color: 'var(--text-main)' }}>
            {book.title}
          </h3>
        </div>
        <StatusBadge status={book.status} />
      </div>

      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        <div>ISBN: <strong style={{ color: 'var(--text-main)' }}>{book.isbn || 'Pending Assignment'}</strong></div>
        {book.publicationDate && <div>Published: {book.publicationDate}</div>}
        <div>MRP: ₹{book.mrp} • Royalty/Copy: ₹{book.authorRoyaltyPerCopy}</div>
      </div>

      {/* Production Stage Notice if not yet published */}
      {isProduction && (
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.75rem', fontSize: '0.75rem', color: '#fbbf24' }}>
          ⚙️ In Production: Proofreading & ISBN Assignment pipeline active.
        </div>
      )}

      {/* Financials & Royalties Box */}
      <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem' }}>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Copies Sold</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{book.totalCopiesSold ?? 0}</div>
        </div>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Total Royalty</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981' }}>
            ₹{(book.totalRoyaltyEarned || 0).toLocaleString()}
          </div>
        </div>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Paid Payouts</div>
          <div style={{ fontWeight: 600 }}>₹{(book.royaltyPaid || 0).toLocaleString()}</div>
        </div>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Pending Payout</div>
          <div style={{ fontWeight: 600, color: isPendingPayout ? '#f59e0b' : 'var(--text-muted)' }}>
            ₹{(book.royaltyPending || 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Edge case info badges */}
      {isZeroRoyalty && !isProduction && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          ℹ️ No royalty earned yet this cycle (below payout threshold).
        </div>
      )}

      {/* Distribution channels */}
      {book.availableOn && book.availableOn.length > 0 && (
        <div style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Available on:</span>
          {book.availableOn.map((channel, idx) => (
            <span key={idx} style={{ fontSize: '0.7rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
              {channel}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
