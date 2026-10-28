import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authorService } from '../../services/authorService';

export default function CreateTicketPage() {
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const data = await authorService.getBooks();
        setBooks(data || []);
      } catch (err) {
        console.warn('Could not load books for ticket dropdown:', err.message);
      }
    };
    fetchBooks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim()) {
      setError('Please provide a subject line');
      return;
    }
    if (!description.trim()) {
      setError('Please describe your query in detail');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      await authorService.createTicket({
        subject: subject.trim(),
        description: description.trim(),
        bookId: selectedBookId || null,
      });

      navigate('/author/tickets');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit ticket';
      setError(msg);
      setSubmitting(false);
    }
  };

  const handleSimulateFile = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachmentName(e.target.files[0].name);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Raise a Support Ticket</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Our editorial, publishing, and royalty specialists triage and address author inquiries promptly.
        </p>
      </div>

      <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>✨</span>
        <span>
          <strong>AI-Assisted Triage:</strong> BookLeaf AI will automatically evaluate your query, categorize the request, and route priority to the appropriate operations desk.
        </span>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Book Selector */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>
            Associated Book (Optional)
          </label>
          <select
            value={selectedBookId}
            onChange={(e) => setSelectedBookId(e.target.value)}
            style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)' }}
          >
            <option value="">General / Account Level (Not tied to a specific title)</option>
            {books.map((b) => (
              <option key={b.bookId || b._id} value={b.bookId}>
                {b.title} (ISBN: {b.isbn || 'Pending'})
              </option>
            ))}
          </select>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
            Select a specific book from your catalog or select General/Account level.
          </span>
        </div>

        {/* Subject */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>
            Subject Line *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Q3 Royalty payout discrepancy or ISBN error on Amazon"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)' }}
          />
        </div>

        {/* Detailed Description */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>
            Detailed Description *
          </label>
          <textarea
            required
            rows={6}
            placeholder="Please detail your question, relevant dates, affected sales platforms, or physical defects..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', lineHeight: 1.5 }}
          />
        </div>

        {/* File Attachment UI (Optional attachment mockup requirement) */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 600 }}>
            Attachments (Optional photo/statement evidence)
          </label>
          <div style={{ border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.01)' }}>
            <input
              type="file"
              id="file-upload"
              onChange={handleSimulateFile}
              style={{ display: 'none' }}
            />
            <label htmlFor="file-upload" className="btn-secondary" style={{ cursor: 'pointer', display: 'inline-block', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
              📁 Choose File to Attach
            </label>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              {attachmentName ? `Selected file: ${attachmentName}` : 'Upload photo of print defect, royalty invoice, or screenshot.'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button
            type="button"
            onClick={() => navigate('/author/tickets')}
            disabled={submitting}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
            style={{ minWidth: '160px' }}
          >
            {submitting ? 'Submitting & AI Triaging...' : 'Submit Support Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
}
