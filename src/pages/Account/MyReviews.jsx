import { useState, useEffect } from 'react';
import axios from 'axios';

function Stars({ rating }) {
    return (
        <span>
            {[1, 2, 3, 4, 5].map(s => (
                <span key={s} style={{ color: s <= rating ? '#111' : '#ddd', fontSize: 13 }}>★</span>
            ))}
        </span>
    );
}

export default function MyReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        const fetchMyReviews = async () => {
            try {
                const response = await axios.get('/api/reviews/my-reviews');
                setReviews(response.data);
            } catch (err) {
                setError('Failed to load reviews.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMyReviews();
    }, []);

    const handleDelete = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        setDeletingId(reviewId);
        try {
            await axios.delete(`/api/reviews/${reviewId}`);
            setReviews(prev => prev.filter(r => r.reviewId !== reviewId));
        } catch (err) {
            alert('Failed to delete review. Please try again.');
            console.error(err);
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) return <p className="placeholder-text">Loading your reviews...</p>;
    if (error) return <p className="placeholder-text">{error}</p>;

    if (reviews.length === 0) {
        return (
            <div className="tab-pane">
                <p className="placeholder-text">You have no previous reviews.</p>
            </div>
        );
    }

    return (
        <div className="tab-pane">
            {reviews.map(review => (
                <div key={review.reviewId} style={{ borderBottom: '1px solid #e5e5e5', padding: '20px 0' }}>

                    {/* Product name + delete button */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#888', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            {review.productName}
                        </p>
                        <button
                            onClick={() => handleDelete(review.reviewId)}
                            disabled={deletingId === review.reviewId}
                            style={{
                                background: 'none',
                                border: '1px solid #ddd',
                                color: '#aaa',
                                fontSize: 11,
                                fontWeight: 700,
                                padding: '4px 12px',
                                cursor: 'pointer',
                                letterSpacing: '0.06em',
                                textTransform: 'uppercase',
                                borderRadius: 4,
                                transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { e.target.style.borderColor = '#cc0000'; e.target.style.color = '#cc0000'; }}
                            onMouseLeave={e => { e.target.style.borderColor = '#ddd'; e.target.style.color = '#aaa'; }}
                        >
                            {deletingId === review.reviewId ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>

                    {/* Rating + date */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <Stars rating={review.rating} />
                        <span style={{ fontSize: 12, color: '#aaa', fontWeight: 400 }}>
                            {new Date(review.createdAt).toLocaleDateString('en-GB', {
                                day: '2-digit', month: 'short', year: 'numeric'
                            })}
                        </span>
                    </div>

                    {/* Review body */}
                    {review.body && (
                     <p style={{ margin: 0, fontSize: 14, fontWeight: 400, color: '#444', lineHeight: 1.7 }}>
                    {review.body}
                     </p>
            )}

                    {/* Review image */}
                    {review.imageUrl && (
                      <img
                      src={review.imageUrl}
                        alt="Review"
                        onClick={() => window.open(review.imageUrl, '_blank')}
                        style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 4, marginTop: 10, cursor: 'pointer', border: '1px solid #e5e5e5' }}
                     />
                     )}
                </div>
            ))}
        </div>
    );
}