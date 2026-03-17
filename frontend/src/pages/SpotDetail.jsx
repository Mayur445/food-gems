import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSpotById } from '../api/spots';
import api from '../api/axios';

function SpotDetail() {
  const { id } = useParams();
  const [spot, setSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [review, setReview] = useState({ rating: 5, title: '', body: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  const fetchSpot = async () => {
    try {
      const data = await getSpotById(id);
      setSpot(data.data);
    } catch (err) {
      setError('Failed to load spot');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpot();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    setReviewError('');
    setReviewSuccess(false);
    try {
      await api.post(`/spots/${id}/reviews`, {
        rating: parseInt(review.rating),
        title: review.title,
        body: review.body
      });
      await fetchSpot();
      setReview({ rating: 5, title: '', body: '' });
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) return (
    <div style={styles.loadingPage}>
      <div style={styles.loadingSpinner}>🍜</div>
      <p style={styles.loadingText}>Loading spot...</p>
    </div>
  );

  if (error) return (
    <div style={styles.errorPage}>
      <p style={styles.errorIcon}>😕</p>
      <h2>Something went wrong</h2>
      <p>{error}</p>
      <Link to="/" style={styles.backBtn}>← Back to Home</Link>
    </div>
  );

  if (!spot) return null;

  const primaryPhoto = spot.photos?.find(p => p.isPrimary) || spot.photos?.[0];

  return (
    <div style={styles.page}>
      {/* Hero Image */}
      <div style={styles.hero} className="spot-hero">
        {primaryPhoto ? (
          <img src={primaryPhoto.url} alt={spot.name} style={styles.heroImage} />
        ) : (
          <div style={styles.heroPlaceholder}>🍽️</div>
        )}
        <div style={styles.heroOverlay} />
        <div style={styles.heroContent} className="spot-hero-content">
          <Link to="/" style={styles.backLink}>← Back to Explore</Link>
          <div style={styles.heroBadge}>{spot.category}</div>
          <h1 style={styles.heroTitle} className="spot-hero-title">{spot.name}</h1>
          <div style={styles.heroMeta} className="spot-hero-meta">
            <span>📍 {spot.address ? `${spot.address}, ` : ''}{spot.city}</span>
            <span style={styles.heroDot}>·</span>
            <span>⭐ {spot.avgRating > 0 ? spot.avgRating.toFixed(1) : 'New'}</span>
            <span style={styles.heroDot}>·</span>
            <span>
              {spot.priceRange === 'cheap' ? '💰 Budget' :
               spot.priceRange === 'moderate' ? '💰💰 Moderate' : '💰💰💰 Premium'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.main} className="spot-main">
        <div style={styles.content}>

          {/* About */}
          <div style={styles.section} className="spot-section">
            <h2 style={styles.sectionTitle} className="spot-section-title">About this place</h2>
            <p style={styles.description}>{spot.description}</p>
            <p style={styles.addedBy}>
              ✦ Added by <strong>{spot.user?.name}</strong>
            </p>
          </div>

          {/* Photo Gallery */}
          {spot.photos && spot.photos.length > 1 && (
            <div style={styles.section} className="spot-section">
              <h2 style={styles.sectionTitle} className="spot-section-title">Photos</h2>
              <div style={styles.photoGrid} className="photo-grid">
                {spot.photos.map((photo) => (
                  <div key={photo.id} style={styles.photoWrapper}>
                    <img
                      src={photo.url}
                      alt={photo.caption || spot.name}
                      style={styles.photo}
                    />
                    {photo.caption && (
                      <p style={styles.photoCaption}>{photo.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div style={styles.section} className="spot-section">
            <div style={styles.reviewsHeader} className="reviews-header">
              <h2 style={styles.sectionTitle} className="spot-section-title">
                Reviews
                <span style={styles.reviewCount}>
                  {spot.reviews?.length || 0}
                </span>
              </h2>
              {spot.avgRating > 0 && (
                <div style={styles.avgRating}>
                  <span style={styles.avgRatingNum}>{spot.avgRating.toFixed(1)}</span>
                  <div>
                    <div style={styles.stars}>
                      {'⭐'.repeat(Math.round(spot.avgRating))}
                    </div>
                    <p style={styles.avgRatingLabel}>Average rating</p>
                  </div>
                </div>
              )}
            </div>

            {spot.reviews && spot.reviews.length > 0 ? (
              <div style={styles.reviewsList}>
                {spot.reviews.map((review) => (
                  <div key={review.id} style={styles.reviewCard}>
                    <div style={styles.reviewTop}>
                      <div style={styles.reviewAvatar}>
                        {review.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div style={styles.reviewMeta}>
                        <p style={styles.reviewName}>{review.user?.name}</p>
                        <p style={styles.reviewDate}>
                          {new Date(review.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric', month: 'long', day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div style={styles.reviewStars}>
                        {'⭐'.repeat(review.rating)}
                      </div>
                    </div>
                    {review.title && (
                      <h4 style={styles.reviewTitle}>{review.title}</h4>
                    )}
                    <p style={styles.reviewBody}>{review.body}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.noReviews}>
                <p style={styles.noReviewsIcon}>💬</p>
                <p style={styles.noReviewsText}>No reviews yet — be the first!</p>
              </div>
            )}
          </div>

          {/* Write Review */}
          {isLoggedIn ? (
            <div style={styles.section} className="spot-section">
              <h2 style={styles.sectionTitle} className="spot-section-title">Write a Review</h2>

              {reviewError && (
                <div style={styles.errorBox}>⚠️ {reviewError}</div>
              )}
              {reviewSuccess && (
                <div style={styles.successBox}>✅ Review submitted successfully!</div>
              )}

              <form onSubmit={handleReviewSubmit}>
                {/* Star Rating */}
                <div style={styles.field}>
                  <label style={styles.label}>Your Rating</label>
                  <div style={styles.starSelector}>
                    {[5, 4, 3, 2, 1].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReview({ ...review, rating: star })}
                        style={{
                          ...styles.starBtn,
                          ...(review.rating >= star ? styles.starBtnActive : {})
                        }}
                      >
                        ⭐ {star}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Title (optional)</label>
                  <input
                    value={review.title}
                    onChange={(e) => setReview({ ...review, title: e.target.value })}
                    style={styles.input}
                    placeholder="Summarize your experience"
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Your Review *</label>
                  <textarea
                    value={review.body}
                    onChange={(e) => setReview({ ...review, body: e.target.value })}
                    style={styles.textarea}
                    placeholder="Tell others what you loved about this place..."
                    required
                    rows={4}
                  />
                </div>

                <button
                  type="submit"
                  style={styles.submitBtn}
                  disabled={reviewLoading}
                >
                  {reviewLoading ? 'Submitting...' : '✦ Submit Review'}
                </button>
              </form>
            </div>
          ) : (
            <div style={styles.loginPrompt}>
              <p style={styles.loginPromptText}>
                Want to share your experience?
              </p>
              <Link to="/login" style={styles.loginPromptBtn}>
                Login to Write a Review
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    backgroundColor: 'var(--cream)',
    minHeight: 'calc(100vh - 68px)',
  },
  loadingPage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 68px)',
    gap: '16px',
  },
  loadingSpinner: {
    fontSize: '48px',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  loadingText: {
    color: 'var(--text-light)',
    fontSize: '16px',
  },
  errorPage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 68px)',
    gap: '12px',
    textAlign: 'center',
    padding: '40px',
  },
  errorIcon: {
    fontSize: '48px',
  },
  backBtn: {
    marginTop: '16px',
    color: 'var(--primary)',
    fontWeight: '600',
    textDecoration: 'none',
  },
  hero: {
    position: 'relative',
    height: '480px',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'var(--dark)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '80px',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '40px',
    maxWidth: '900px',
    margin: '0 auto',
  },
  backLink: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '14px',
    textDecoration: 'none',
    display: 'block',
    marginBottom: '16px',
  },
  heroBadge: {
    display: 'inline-block',
    backgroundColor: 'var(--primary)',
    color: 'white',
    padding: '4px 14px',
    borderRadius: '100px',
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    marginBottom: '12px',
  },
  heroTitle: {
    fontSize: '42px',
    color: 'white',
    fontFamily: 'Playfair Display, serif',
    marginBottom: '12px',
    lineHeight: '1.2',
  },
  heroMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: 'rgba(255,255,255,0.8)',
    fontSize: '15px',
    flexWrap: 'wrap',
  },
  heroDot: {
    color: 'rgba(255,255,255,0.4)',
  },
  main: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px 24px 60px',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '32px',
    boxShadow: 'var(--shadow-sm)',
  },
  sectionTitle: {
    fontSize: '22px',
    color: 'var(--dark)',
    fontFamily: 'Playfair Display, serif',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  reviewCount: {
    backgroundColor: 'var(--cream)',
    color: 'var(--text-light)',
    fontSize: '14px',
    fontFamily: 'DM Sans, sans-serif',
    padding: '2px 10px',
    borderRadius: '100px',
    fontWeight: '600',
  },
  description: {
    color: '#444',
    lineHeight: '1.8',
    fontSize: '16px',
    marginBottom: '16px',
  },
  addedBy: {
    color: 'var(--text-light)',
    fontSize: '14px',
  },
  photoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '12px',
  },
  photoWrapper: {
    borderRadius: '12px',
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    display: 'block',
  },
  photoCaption: {
    fontSize: '12px',
    color: 'var(--text-light)',
    padding: '8px',
    backgroundColor: 'var(--cream)',
    textAlign: 'center',
  },
  reviewsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },
  avgRating: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: 'var(--cream)',
    padding: '12px 20px',
    borderRadius: '12px',
  },
  avgRatingNum: {
    fontSize: '36px',
    fontWeight: '700',
    color: 'var(--dark)',
    fontFamily: 'Playfair Display, serif',
  },
  stars: {
    fontSize: '14px',
    marginBottom: '2px',
  },
  avgRatingLabel: {
    fontSize: '11px',
    color: 'var(--text-light)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  reviewsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  reviewCard: {
    padding: '20px',
    backgroundColor: 'var(--cream)',
    borderRadius: '16px',
  },
  reviewTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  reviewAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '700',
    flexShrink: 0,
  },
  reviewMeta: {
    flex: 1,
    minWidth: 0,
  },
  reviewName: {
    fontWeight: '600',
    color: 'var(--dark)',
    fontSize: '15px',
  },
  reviewDate: {
    color: 'var(--text-light)',
    fontSize: '12px',
  },
  reviewStars: {
    fontSize: '14px',
    flexShrink: 0,
  },
  reviewTitle: {
    color: 'var(--dark)',
    fontSize: '16px',
    marginBottom: '8px',
    fontFamily: 'Playfair Display, serif',
  },
  reviewBody: {
    color: '#555',
    lineHeight: '1.6',
    fontSize: '15px',
  },
  noReviews: {
    textAlign: 'center',
    padding: '40px',
  },
  noReviewsIcon: {
    fontSize: '40px',
    marginBottom: '12px',
  },
  noReviewsText: {
    color: 'var(--text-light)',
    fontSize: '16px',
  },
  field: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text)',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  starSelector: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  starBtn: {
    padding: '8px 16px',
    borderRadius: '100px',
    border: '2px solid var(--cream-dark)',
    backgroundColor: 'transparent',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-light)',
    cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
    transition: 'all 0.2s',
  },
  starBtnActive: {
    backgroundColor: 'var(--primary)',
    borderColor: 'var(--primary)',
    color: 'white',
  },
  input: {
    width: '100%',
    padding: '13px 16px',
    border: '2px solid var(--cream-dark)',
    borderRadius: '12px',
    fontSize: '15px',
    color: 'var(--text)',
    backgroundColor: 'var(--cream)',
    boxSizing: 'border-box',
    outline: 'none',
  },
  textarea: {
    width: '100%',
    padding: '13px 16px',
    border: '2px solid var(--cream-dark)',
    borderRadius: '12px',
    fontSize: '15px',
    color: 'var(--text)',
    backgroundColor: 'var(--cream)',
    boxSizing: 'border-box',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'DM Sans, sans-serif',
  },
  submitBtn: {
    padding: '13px 32px',
    backgroundColor: 'var(--primary)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
    width: '100%',
  },
  errorBox: {
    backgroundColor: '#fff0f0',
    border: '1px solid #ffcccc',
    color: '#cc0000',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    marginBottom: '20px',
  },
  successBox: {
    backgroundColor: '#f0fff4',
    border: '1px solid #86efac',
    color: '#166534',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    marginBottom: '20px',
  },
  loginPrompt: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: 'var(--shadow-sm)',
    textAlign: 'center',
  },
  loginPromptText: {
    color: 'var(--text-light)',
    fontSize: '16px',
    marginBottom: '16px',
  },
  loginPromptBtn: {
    display: 'inline-block',
    backgroundColor: 'var(--primary)',
    color: 'white',
    padding: '12px 28px',
    borderRadius: '100px',
    fontWeight: '600',
    textDecoration: 'none',
    fontSize: '15px',
  },
};

export default SpotDetail;
