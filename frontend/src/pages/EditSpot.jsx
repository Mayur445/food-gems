import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getSpotById, updateSpot, uploadPhoto } from '../api/spots';

const CATEGORIES = [
  'Street Food', 'Tea Stall', 'Cafe',
  'Restaurant', 'Bakery', 'Juice Shop', 'Biryani', 'Sweets'
];

function EditSpot() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [existingPhoto, setExistingPhoto] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
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
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchSpot();
  }, []);

  const fetchSpot = async () => {
    try {
      const data = await getSpotById(id);
      const spot = data.data;

      // Check ownership — only the creator can edit
      if (spot.createdBy !== user?.id) {
        toast.error('You can only edit your own spots');
        navigate('/profile');
        return;
      }

      setFormData({
        name: spot.name || '',
        description: spot.description || '',
        address: spot.address || '',
        city: spot.city || '',
        latitude: spot.latitude || '',
        longitude: spot.longitude || '',
        priceRange: spot.priceRange || 'cheap',
        category: spot.category || 'Street Food',
      });

      // Set existing primary photo as preview
      const primary = spot.photos?.find(p => p.isPrimary) || spot.photos?.[0];
      if (primary) {
        setExistingPhoto(primary.url);
        setPhotoPreview(primary.url);
      }
    } catch (err) {
      toast.error('Failed to load spot');
      navigate('/profile');
    } finally {
      setFetching(false);
    }
  };

  const handleGetLocation = () => {
    setLocationLoading(true);

    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await response.json();
          const city = data.address?.city ||
                       data.address?.town ||
                       data.address?.village ||
                       data.address?.county || '';
          const address = data.address?.road ||
                          data.address?.neighbourhood ||
                          data.address?.suburb || '';
          setFormData(prev => ({ ...prev, latitude, longitude, city, address }));
          toast.success('📍 Location updated!');
        } catch (err) {
          setFormData(prev => ({ ...prev, latitude, longitude }));
          toast.success('📍 Location updated!');
        }
        setLocationLoading(false);
      },
      (error) => {
        setLocationLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          toast.error('Location permission denied. Please allow access or enter manually.');
        } else {
          toast.error('Could not get your location. Please enter manually.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
      setExistingPhoto(null);
    }
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    setExistingPhoto(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.latitude || !formData.longitude) {
      toast.error('Please share your location or enter coordinates manually');
      return;
    }

    setLoading(true);
    try {
      await updateSpot(id, formData);

      // Upload new photo if user selected one
      if (photo) {
        const photoFormData = new FormData();
        photoFormData.append('photo', photo);
        photoFormData.append('caption', formData.name);
        photoFormData.append('isPrimary', 'true');
        await uploadPhoto(id, photoFormData);
      }

      toast.success(`✅ "${formData.name}" updated successfully!`);
      navigate(`/spots/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update spot');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div style={styles.loadingPage}>
      <div style={styles.loadingSpinner}>🍜</div>
      <p style={styles.loadingText}>Loading spot...</p>
    </div>
  );

  return (
    <div style={styles.page} className="split-page">
      {/* Left Side */}
      <div style={styles.left} className="split-left">
        <div style={styles.leftInner} className="split-left-inner">
          <div style={styles.badge}>✎ Edit Spot</div>
          <h1 style={styles.title} className="split-left-title">Update your<br />food gem.</h1>
          <p style={styles.subtitle} className="split-left-subtitle">
            Keep your listing accurate and up to date so travelers always get the best experience.
          </p>
          <div style={styles.tips} className="split-left-extras">
            <p style={styles.tipsTitle}>✦ Tips for a great listing</p>
            {[
              '📸 Add a clear photo of the food or place',
              '📍 Make sure location is accurate',
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

      {/* Right Side */}
      <div style={styles.right} className="split-right">
        <div style={styles.card} className="split-card">
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>Edit Food Spot</h2>
              <p style={styles.cardSubtitle}>Update the details below</p>
            </div>
            <Link to={`/spots/${id}`} style={styles.cancelLink}>← Cancel</Link>
          </div>

          <form onSubmit={handleSubmit}>

            {/* Photo Upload */}
            <div style={styles.field}>
              <label style={styles.label}>Photo</label>
              {photoPreview ? (
                <div style={styles.previewWrapper}>
                  <img src={photoPreview} alt="Preview" style={styles.previewImage} />
                  {existingPhoto && (
                    <div style={styles.existingPhotoBadge}>Current photo</div>
                  )}
                  <div style={styles.previewOverlay}>
                    <button type="button" onClick={handleRemovePhoto} style={styles.removePhotoBtn}>
                      ✕ Remove
                    </button>
                    <button type="button" onClick={() => fileInputRef.current.click()} style={styles.changePhotoBtn}>
                      📸 Change
                    </button>
                  </div>
                </div>
              ) : (
                <div style={styles.uploadZone} onClick={() => fileInputRef.current.click()}>
                  <p style={styles.uploadIcon}>📸</p>
                  <p style={styles.uploadText}>Click to upload a new photo</p>
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

            {/* Location */}
            <div style={styles.field}>
              <label style={styles.label}>Location *</label>

              {formData.latitude && formData.longitude ? (
                <div style={styles.locationConfirmed}>
                  <span>✅ Location set!</span>
                  <span style={styles.locationCoords}>
                    {Number(formData.latitude).toFixed(4)}, {Number(formData.longitude).toFixed(4)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, latitude: '', longitude: '', city: '', address: '' })}
                    style={styles.locationClearBtn}
                  >
                    ✕ Clear
                  </button>
                </div>
              ) : (
                <div style={styles.locationOptions}>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    style={styles.locationBtn}
                    disabled={locationLoading}
                  >
                    <span style={styles.locationBtnIcon}>📍</span>
                    <div>
                      <p style={styles.locationBtnTitle}>
                        {locationLoading ? 'Getting your location...' : 'Use My Current Location'}
                      </p>
                      <p style={styles.locationBtnDesc}>Like WhatsApp location sharing</p>
                    </div>
                  </button>

                  <div style={styles.locationDivider}>
                    <div style={styles.locationDividerLine} />
                    <span>or enter manually</span>
                    <div style={styles.locationDividerLine} />
                  </div>

                  <div style={styles.row}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <input name="city" value={formData.city} onChange={handleChange} style={styles.input} placeholder="City" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <input name="address" value={formData.address} onChange={handleChange} style={styles.input} placeholder="Area / Street" />
                    </div>
                  </div>
                  <div style={styles.row}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <input name="latitude" value={formData.latitude} onChange={handleChange} style={styles.input} placeholder="Latitude (e.g. 12.9716)" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <input name="longitude" value={formData.longitude} onChange={handleChange} style={styles.input} placeholder="Longitude (e.g. 77.5946)" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Price Range */}
            <div style={styles.field}>
              <label style={styles.label}>Price Range *</label>
              <div style={styles.priceRow} className="price-row">
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

            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? '⏳ Saving changes...' : '✅ Save Changes →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
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
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '28px',
  },
  cardTitle: {
    fontSize: '28px',
    color: 'var(--dark)',
    marginBottom: '4px',
    fontFamily: 'Playfair Display, serif',
  },
  cardSubtitle: {
    color: 'var(--text-light)',
    fontSize: '15px',
  },
  cancelLink: {
    color: 'var(--text-light)',
    fontSize: '14px',
    textDecoration: 'none',
    fontWeight: '500',
    marginTop: '6px',
  },
  existingPhotoBadge: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: 'white',
    padding: '4px 10px',
    borderRadius: '100px',
    fontSize: '11px',
    fontWeight: '600',
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
    gap: '12px',
    marginBottom: '12px',
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
  locationOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  locationBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
    backgroundColor: 'var(--cream)',
    border: '2px solid var(--cream-dark)',
    borderRadius: '12px',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    fontFamily: 'DM Sans, sans-serif',
    transition: 'all 0.2s',
  },
  locationBtnIcon: {
    fontSize: '28px',
    flexShrink: 0,
  },
  locationBtnTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--text)',
    marginBottom: '2px',
  },
  locationBtnDesc: {
    fontSize: '12px',
    color: 'var(--text-light)',
  },
  locationDivider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: 'var(--text-light)',
    fontSize: '13px',
  },
  locationDividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: 'var(--cream-dark)',
  },
  locationConfirmed: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    fontSize: '14px',
    color: '#166534',
    backgroundColor: '#f0fff4',
    border: '1px solid #86efac',
    padding: '14px 16px',
    borderRadius: '12px',
    flexWrap: 'wrap',
  },
  locationCoords: {
    fontSize: '12px',
    color: '#666',
    fontFamily: 'Courier New, monospace',
  },
  locationClearBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#666',
    cursor: 'pointer',
    fontSize: '13px',
    flexShrink: 0,
  },
  uploadZone: {
    border: '2px dashed var(--cream-dark)',
    borderRadius: '16px',
    padding: '40px 20px',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: 'var(--cream)',
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

export default EditSpot;