import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { authorService } from '../../services/authorService';
import BookCard from '../../components/author/BookCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function MyBooksPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const data = await authorService.getBooks();
        setBooks(data || []);
      } catch (err) {
        setError(err.message || 'Failed to load books');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>My Published Books</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Manage manuscript catalog, ISBN listings, sales volumes, and quarterly royalty earnings.
          </p>
        </div>
        <Link to="/author/tickets/create" className="btn-primary">
          + Submit Book Inquiry
        </Link>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <LoadingSpinner />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Fetching your books...</p>
        </div>
      ) : books.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📚</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>No Books Registered</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            You do not have any active books linked to this author profile yet.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {books.map((book) => (
            <BookCard key={book._id || book.bookId} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
