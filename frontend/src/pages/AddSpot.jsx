import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSpot, uploadPhoto } from '../api/spots';

const CATEGORIES = [
  'Street Food', 'Tea Stall', 'Cafe',
  'Restaurant', 'Bakery', 'Juice Shop', 'Biryani', 'Sweets'
];

function AddSpot() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    latitude: '',
    longitude: '',
    priceRange: 'cheap',
    category: 'Street Food',
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) navigate('/login');
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      // Create a preview URL so user can see the image before uploading
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
    }
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Step 1 — Create the spot
      const spotResponse = await createSpot({
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
      });

      const newSpotId = spotResponse.data.id;

      // Step 2 — Upload photo if one was selected
      if (photo) {
        const photoFormData = new FormData();
        photoFormData.append('photo', photo);
        photoFormData.append('caption', formData.name);
        photoFormData.append('isPrimary', 'true');
        await uploadPhoto(newSpotId, photoFormData);
      }

      navigate(`/spots/${newSpotId}`);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create spot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Left Side — Tips */}
      <div style={styles.left}>
        <div style={styles.leftInner}>
          <div style={styles.badge}>🍽️ Share a Gem</div>
          <h1 style={styles.title}>Know a hidden<br />food paradise?</h1>
          <p style={styles.subtitle}>
            Share it with travelers who are searching for authentic, real food experiences.
          </p>
          <div style={styles.tips}>
            <p style={styles.tipsTitle}>✦ Tips for a great listing</p>
            {[
              '📸 Add a clear photo of the food or place',
              '📍 Be specific about the location',
              '✍️ Describe what makes it special',
              '💰 Set the right price range',
              '🗂️ Choose the correct category',
            ].map((tip, i) => (
              <div key={i} style={styles.tip}>{tip}</div>
            ))}
          </div>
        </div>
        <div style={styles.circle1} />
        <div style={styles.circle2} />
      </div>

      {/* Right Side — Form */}
      <div style={styles.right}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Add a Food Spot</h2>
          <p style={styles.cardSubtitle}>Fill in the details below</p>

          {error && <div style={styles.errorBox}>⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>

            {/* Photo Upload */}
            <div style={styles.field}>
              <label style={styles.label}>Photo</label>
              {photoPreview ? (
                <div style={styles.previewWrapper}>
                  <img
                    src={photoPreview}
                    alt="Preview"
                    style={styles.previewImage}
                  />
                  <div style={styles.previewOverlay}>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      style={styles.removePhotoBtn}
                    >
                      ✕ Remove
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      style={styles.changePhotoBtn}
                    >
                      📸 Change
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  style={styles.uploadZone}
                  onClick={() => fileInputRef.current.click()}
                >
                  <p style={styles.uploadIcon}>📸</p>
                  <p style={styles.uploadText}>Click to upload a photo</p>
                  <p style={styles.uploadHint}>JPG, PNG or WebP — max 5MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
            </div>

            {/* Name */}
            <div style={styles.field}>
              <label style={styles.label}>Spot Name *</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={styles.input}
                placeholder="e.g. Ramesh Dosa Corner"
                required
              />
            </div>

            {/* Description */}
            <div style={styles.field}>
              <label style={styles.label}>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                style={styles.textarea}
                placeholder="What makes this place special? What should people try?"
                required
                rows={4}
              />
            </div>

            {/* Category */}
            <div style={styles.field}>
              <label style={styles.label}>Category *</label>
              <div style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat })}
                    style={{
                      ...styles.catBtn,
                      ...(formData.category === cat ? styles.catBtnActive : {})
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* City & Address */}
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>City *</label>
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="e.g. Bengaluru"
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Address</label>
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Street / Area"
                />
              </div>
            </div>

            {/* Coordinates */}
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Latitude *</label>
                <input
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="e.g. 12.9716"
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Longitude *</label>
                <input
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="e.g. 77.5946"
                  required
                />
              </div>
            </div>

            {/* Price Range */}
            <div style={styles.field}>
              <label style={styles.label}>Price Range *</label>
              <div style={styles.priceRow}>
                {[
                  { value: 'cheap', label: '💰 Budget', desc: 'Under ₹100' },
                  { value: 'moderate', label: '💰💰 Moderate', desc: '₹100–₹300' },
                  { value: 'expensive', label: '💰💰💰 Premium', desc: 'Above ₹300' },
                ].map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, priceRange: p.value })}
                    style={{
                      ...styles.priceBtn,
                      ...(formData.priceRange === p.value ? styles.priceBtnActive : {})
                    }}
                  >
                    <span style={styles.priceBtnLabel}>{p.label}</span>
                    <span style={styles.priceBtnDesc}>{p.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              style={styles.submitBtn}
              disabled={loading}
            >
              {loading ? (
                <span>⏳ {photo ? 'Creating spot & uploading photo...' : 'Adding spot...'}</span>
              ) : (
                '🍽️ Add This Gem →'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: 'flex',
    minHeight: 'calc(100vh - 68px)',
  },
  left: {
    width: '380px',
    flexShrink: 0,
    background: 'linear-gradient(135deg, #2D1500 0%, #4A2000 100%)',
    padding: '60px 40px',
    display: 'flex',
    alignItems: 'flex-start',
    position: 'relative',
    overflow: 'hidden',
  },
  leftInner: {
    position: 'relative',
    zIndex: 2,
  },
  badge: {
    display: 'inline-block',
    backgroundColor: 'rgba(232,116,26,0.25)',
    color: 'var(--primary)',
    padding: '6px 16px',
    borderRadius: '100px',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '24px',
    border: '1px solid rgba(232,116,26,0.3)',
  },
  title: {
    fontSize: '36px',
    color: 'white',
    lineHeight: '1.2',
    marginBottom: '16px',
    fontFamily: 'Playfair Display, serif',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '15px',
    lineHeight: '1.7',
    marginBottom: '32px',
  },
  tips: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  tipsTitle: {
    color: 'var(--primary)',
    fontSize: '13px',
    fontWeight: '700',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    marginBottom: '4px',
  },
  tip: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '14px',
    lineHeight: '1.5',
  },
  circle1: {
    position: 'absolute',
    top: '-80px',
    right: '-80px',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    backgroundColor: 'rgba(232,116,26,0.1)',
    zIndex: 1,
  },
  circle2: {
    position: 'absolute',
    bottom: '-60px',
    left: '-60px',
    width: '220px',
    height: '220px',
    borderRadius: '50%',
    backgroundColor: 'rgba(232,116,26,0.07)',
    zIndex: 1,
  },
  right: {
    flex: 1,
    padding: '40px',
    backgroundColor: 'var(--cream)',
    overflowY: 'auto',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '24px',
    padding: '40px',
    boxShadow: 'var(--shadow-md)',
    maxWidth: '700px',
    margin: '0 auto',
  },
  cardTitle: {
    fontSize: '28px',
    color: 'var(--dark)',
    marginBottom: '6px',
    fontFamily: 'Playfair Display, serif',
  },
  cardSubtitle: {
    color: 'var(--text-light)',
    fontSize: '15px',
    marginBottom: '28px',
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
  field: {
    marginBottom: '20px',
    flex: 1,
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
  row: {
    display: 'flex',
    gap: '16px',
  },
  categoryGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  catBtn: {
    padding: '8px 16px',
    borderRadius: '100px',
    border: '2px solid var(--cream-dark)',
    backgroundColor: 'transparent',
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--text-light)',
    cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
    transition: 'all 0.2s',
  },
  catBtnActive: {
    backgroundColor: 'var(--primary)',
    borderColor: 'var(--primary)',
    color: 'white',
  },
  priceRow: {
    display: 'flex',
    gap: '12px',
  },
  priceBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '12px',
    border: '2px solid var(--cream-dark)',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    fontFamily: 'DM Sans, sans-serif',
    transition: 'all 0.2s',
  },
  priceBtnActive: {
    borderColor: 'var(--primary)',
    backgroundColor: 'rgba(232,116,26,0.06)',
  },
  priceBtnLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text)',
  },
  priceBtnDesc: {
    fontSize: '11px',
    color: 'var(--text-light)',
  },
  // Photo Upload
  uploadZone: {
    border: '2px dashed var(--cream-dark)',
    borderRadius: '16px',
    padding: '40px 20px',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: 'var(--cream)',
    transition: 'border-color 0.2s',
  },
  uploadIcon: {
    fontSize: '40px',
    marginBottom: '12px',
  },
  uploadText: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--text)',
    marginBottom: '4px',
  },
  uploadHint: {
    fontSize: '13px',
    color: 'var(--text-light)',
  },
  previewWrapper: {
    position: 'relative',
    borderRadius: '16px',
    overflow: 'hidden',
    height: '220px',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '16px',
    background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
  },
  removePhotoBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    border: '1px solid rgba(255,255,255,0.4)',
    color: 'white',
    padding: '6px 14px',
    borderRadius: '100px',
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
    backdropFilter: 'blur(4px)',
  },
  changePhotoBtn: {
    backgroundColor: 'var(--primary)',
    border: 'none',
    color: 'white',
    padding: '6px 14px',
    borderRadius: '100px',
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
  },
  submitBtn: {
    width: '100%',
    padding: '15px',
    backgroundColor: 'var(--primary)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
    fontFamily: 'DM Sans, sans-serif',
  },
};

export default AddSpot;