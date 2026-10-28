import React, { useState } from 'react';
import { adminService } from '../../services/adminService';

export default function AiDraftPanel({ ticketId, onApplyDraft }) {
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState('');
  const [tone, setTone] = useState('empathetic');
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.generateAiDraft(ticketId, tone);
      const generatedText = res?.draft || res;
      setDraft(generatedText);
    } catch (err) {
      setError(err.message || 'Failed to generate AI response draft');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-purple, #a78bfa)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span>✨</span> AI Knowledge Base Draft Assistant
        </h4>
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          disabled={loading}
          style={{ background: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.75rem', border: '1px solid var(--border-color)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}
        >
          <option value="empathetic">Tone: Empathetic</option>
          <option value="professional">Tone: Professional</option>
          <option value="concise">Tone: Concise</option>
        </select>
      </div>

      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        Generates a suggested response citing BookLeaf publishing policies, turnaround windows, and author catalog data.
      </p>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', padding: '0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem' }}>
          {error}
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="btn-secondary"
        style={{ width: '100%', fontSize: '0.85rem', padding: '0.6rem' }}
      >
        {loading ? 'Synthesizing Policy & Catalog Context...' : draft ? '🔄 Regenerate AI Draft' : '✨ Generate AI Draft Response'}
      </button>

      {draft && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.35rem' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Editable AI Draft (Review before sending):
          </label>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={7}
            style={{
              width: '100%',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.65rem',
              fontSize: '0.85rem',
              lineHeight: 1.5,
            }}
          />
          <button
            type="button"
            onClick={() => onApplyDraft(draft)}
            className="btn-primary"
            style={{ fontSize: '0.8rem', padding: '0.5rem' }}
          >
            Insert Draft into Reply Field ↓
          </button>
        </div>
      )}
    </div>
  );
}
