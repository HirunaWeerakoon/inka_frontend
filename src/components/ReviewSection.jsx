import React, { useState, useEffect, useRef } from 'react';
import { getReviewsByProduct, getAverageRating, createReview } from '../services/reviewService';
import { authService } from '../services/authService';
import axios from 'axios';
import './ReviewSection.css';

function UserIcon() {
    return (
        <div className="rv-avatar">
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
                <circle cx="18" cy="18" r="18" fill="#d4d4d4" />
                <circle cx="18" cy="14" r="6" fill="#fff" />
                <ellipse cx="18" cy="30" rx="10" ry="7" fill="#fff" />
            </svg>
        </div>
    );
}

function Stars({ rating, interactive = false, size = 16, onChange }) {
    const [hovered, setHovered] = useState(0);
    const display = interactive && hovered ? hovered : rating;
    return (
        <div className="rv-stars">
            {[1, 2, 3, 4, 5].map((s) => (
                <span
                    key={s}
                    className={`rv-star${s <= display ? '' : ' empty'}${interactive ? ' interactive' : ''}`}
                    style={{ fontSize: size }}
                    onMouseEnter={() => interactive && setHovered(s)}
                    onMouseLeave={() => interactive && setHovered(0)}
                    onClick={() => interactive && onChange && onChange(s)}
                >★</span>
            ))}
        </div>
    );
}

function RatingBar({ label, count, total }) {
    const pct = total > 0 ? (count / total) * 100 : 0;
    return (
        <div className="rv-bar-row">
            <span className="rv-bar-label">{label}</span>
            <div className="rv-bar-track">
                <div className="rv-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="rv-bar-count">{count}</span>
        </div>
    );
}

function ReviewCard({ review }) {
    const [helpful, setHelpful] = useState(0);
    const [voted, setVoted] = useState(false);
    const formattedDate = new Date(review.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
    return (
        <div className="rv-card">
            <div className="rv-card-header">
                <div className="rv-card-left">
                    <UserIcon />
                    <div>
                        <p className="rv-author-name">{review.customerName}</p>
                        <span className="rv-verified">Verified purchase</span>
                    </div>
                </div>
                <div className="rv-card-right">
                    <Stars rating={review.rating} size={13} />
                    <p className="rv-card-date">{formattedDate}</p>
                </div>
            </div>
            {review.body && <p className="rv-card-body">{review.body}</p>}
            {review.imageUrl && (
                <img
                    src={review.imageUrl}
                    alt="Review"
                    onClick={() => window.open(review.imageUrl, '_blank')}
                    style={{ width: 100, height: 100, borderRadius: 4, marginBottom: 12, objectFit: 'cover', cursor: 'pointer' }}
                />
            )}
            <div style={{ marginTop: 12 }}>
                <button
                    className={`rv-helpful-btn${voted ? ' voted' : ''}`}
                    onClick={() => { if (!voted) { setHelpful(h => h + 1); setVoted(true); } }}    >
                    {voted ? '✓ Helpful' : `Helpful (${helpful})`}
                </button>
            </div>
        </div>
    );
}

export default function ReviewSection({ productId }) {
    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(0);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('recent');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [rating, setRating] = useState(0);
    const [body, setBody] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const isLoggedIn = authService.isAuthenticated();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [reviewsData, avgData] = await Promise.all([
                    getReviewsByProduct(productId),
                    getAverageRating(productId)
                ]);
                setReviews(reviewsData);
                setAvgRating(avgData);
            } catch (err) {
                console.error('Error fetching reviews:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [productId]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async () => {
        if (!rating && !body.trim()) return;
        setError('');
        setUploading(true);
        try {
            let imageUrl = null;

            if (imageFile) {
                const formData = new FormData();
                formData.append('file', imageFile);
                const uploadRes = await axios.post('/api/images/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                imageUrl = uploadRes.data.url;
                console.log('imageUrl:', imageUrl); // check if Cloudinary URL is captured
            }

            console.log('review data being sent:', { productId, rating, title: '', body, sizePurchased: '', imageUrl }); // check payload
            const newReview = await createReview({
                productId, rating, title: '', body, sizePurchased: '', imageUrl
            });
            console.log('review response:', newReview); // check if imageUrl is in the response

            setReviews(prev => [newReview, ...prev]);
            setAvgRating(prev => {
                const total = reviews.length + 1;
                return Math.round(((prev * reviews.length + rating) / total) * 10) / 10;
            });
            setSubmitted(true);
        } catch (err) {
            if (err.response?.status === 401) {
                setError('Please log in to submit a review.');
            } else if (err.response?.status === 409) {
                setError('You have already submitted a review for this product.');
            } else if (err.response?.data) {
                setError(typeof err.response.data === 'string'
                    ? err.response.data
                    : 'Something went wrong. Please try again.');
            } else {
                setError('Something went wrong. Please try again.');
            }
        } finally {
            setUploading(false);
        }
    };



    const sorted = [...reviews].sort((a, b) => {
        if (sortBy === 'high') return b.rating - a.rating;
        if (sortBy === 'low') return a.rating - b.rating;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const breakdown = [5, 4, 3, 2, 1].map(n => ({
        label: String(n),
        count: reviews.filter(r => r.rating === n).length
    }));

    if (loading) return <p className="rv-loading">Loading reviews...</p>;

    return (
        <div className="rv-root">
            <div className="rv-summary">
                <div>
                    <p className="rv-score">{avgRating.toFixed(1)}</p>
                    <Stars rating={Math.round(avgRating)} size={18} />
                    <p className="rv-total">{reviews.length} REVIEWS</p>
                </div>
                <div className="rv-bars">
                    {breakdown.map(b => (
                        <RatingBar key={b.label} label={b.label} count={b.count} total={reviews.length} />
                    ))}
                </div>
            </div>

            {submitted ? (
                <div className="rv-success"><p>Review submitted — thank you.</p></div>
            ) : isLoggedIn ? (
                <div className="rv-form">
                    <p className="rv-form-label">Write a review</p>
                    <div className="rv-field">
                        <label className="rv-field-label">Your rating</label>
                        <Stars rating={rating} interactive size={22} onChange={setRating} />
                    </div>
                    <div className="rv-field">
                        <textarea
                            className="rv-textarea"
                            placeholder="Share your experience with this product..."
                            value={body}
                            onChange={e => setBody(e.target.value)}
                        />
                    </div>


                    {/* Image upload */}
                    <div className="rv-field">
                        <label className="rv-field-label" style={{ marginBottom: 8 }}>Add a photo</label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                            {imagePreview && (
                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 4, border: '1px solid #e5e5e5', display: 'block' }}
                                    />
                                    <button
                                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                                        style={{ position: 'absolute', top: -8, right: -8, background: '#111', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, fontSize: 12, cursor: 'pointer', lineHeight: '20px', textAlign: 'center' }}
                                    >×</button>
                                </div>
                            )}
                            <button
                                className={`rv-upload-btn${imageFile ? ' has-photo' : ''}`}
                                onClick={() => fileInputRef.current.click()}
                                type="button"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
                                    <polyline points="21 15 16 10 5 21" />
                                </svg>
                                {imageFile ? 'Photo added' : 'Add photo'}
                            </button>
                        </div>
                    </div>



                    {error && <p className="rv-error">{error}</p>}
                    <button
                        className="rv-submit-btn"
                        onClick={handleSubmit}
                        disabled={(!rating && !body.trim()) || uploading}
                    >
                        {uploading ? 'Uploading...' : 'Submit Review'}
                    </button>
                </div>
            ) : (
                <div className="rv-login-prompt">
                    <p>Sign in with Google to leave a review.<br />Your experience helps others choose with confidence.</p>
                    <button className="rv-login-btn" onClick={() => {
                        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
                        window.location.href = `${apiUrl}/oauth2/authorization/google`;
                    }}>
                        Sign in with Google
                    </button>
                </div>
            )}

            {reviews.length > 0 && (
                <div className="rv-sort-bar">
                    <p className="rv-sort-label">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
                    <div className="rv-sort-options">
                        {[{ id: 'recent', label: 'Newest' }, { id: 'high', label: 'Highest' }, { id: 'low', label: 'Lowest' }].map(opt => (
                            <button key={opt.id} className={`rv-sort-btn${sortBy === opt.id ? ' active' : ''}`} onClick={() => setSortBy(opt.id)}>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {sorted.map(review => (
                <ReviewCard key={review.reviewId} review={review} />
            ))}

            {reviews.length === 0 && (
                <p className="rv-empty">No reviews yet. Be the first to share your experience.</p>
            )}
        </div>
    );
}