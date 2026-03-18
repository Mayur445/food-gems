import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { deleteSpot } from '../api/spots';

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
}

function Profile() {
  const navigate = useNavigate();
  const width = useWindowWidth();
  const isMobile = width <= 768;

  const [user, setUser] = useState(null);
  const [spots, setSpots] = useState([]);
  const [loadingSpots, setLoadingSpots] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', bio: '' });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // spot to delete
  const [deleteLoading, setDeleteLoading] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    const stored = JSON.parse(localStorage.getItem('user') || 'null');
    setUser(stored);
    setEditForm({ name: stored?.name || '', bio: stored?.bio || '' });
    fetchMySpots();
  }, []);

  const fetchMySpots = async () => {
    setLoadingSpots(true);
    try {
      const res = await api.get('/users/me/spots');
      setSpots(res.data.data);
    } catch (err) {
      console.error('Failed to load spots');
    } finally {
      setLoadingSpots(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/users/me', { name: editForm.name, bio: editForm.bio });
      const updated = res.data.data;
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      setEditing(false);
      toast.success('✅ Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteSpot(deleteTarget.id);
      setSpots(spots.filter(s => s.id !== deleteTarget.id));
      toast.success(`🗑️ "${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete spot');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!user) return null;

  const avatarLetter = user.name?.charAt(0).toUpperCase();
  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })
    : 'Early member';

  return (
    <div style={styles.page}>

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div style={styles.dialogOverlay}>
          <div style={styles.dialog}>
            <p style={styles.dialogIcon}>🗑️</p>
            <h3 style={styles.dialogTitle}>Delete this spot?</h3>
            <p style={styles.dialogText}>
              This will permanently delete <strong>"{deleteTarget.name}"</strong> along with all its photos and reviews. This cannot be undone.
            </p>
            <div style={styles.dialogBtns}>
              <button
                onClick={() => setDeleteTarget(null)}
                style={styles.dialogCancelBtn}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                style={styles.dialogDeleteBtn}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div style={styles.banner}>
        <div style={styles.bannerInner}>
          <Link to="/" style={styles.backLink}>← Back to Explore</Link>
        </div>
        <div style={styles.circle1} />
        <div style={styles.circle2} />
      </div>

      {/* Main Content */}
      <div style={{
        ...styles.main,
        padding: isMobile ? '0 16px 40px' : '0 24px 60px',
      }}>
        <div style={{
          ...styles.layout,
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'flex-start',
        }}>

          {/* Left — Profile Card */}
          <div style={{
            ...styles.sidebar,
            width: isMobile ? '100%' : '300px',
            flexShrink: 0,
          }}>
            <div style={styles.profileCard}>
              <div style={styles.avatarWrapper}>
                <div style={styles.avatar}>{avatarLetter}</div>
              </div>

              {editing ? (
                <div style={styles.editForm}>
                  <div style={styles.field}>
                    <label style={styles.label}>Name</label>
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      style={styles.input}
                      placeholder="Your name"
                    />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Bio</label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      style={styles.textarea}
                      placeholder="Tell others a little about yourself..."
                      rows={3}
                    />
                  </div>
                  <div style={styles.editBtns}>
                    <button onClick={() => setEditing(false)} style={styles.cancelBtn}>
                      Cancel
                    </button>
                    <button onClick={handleSave} style={styles.saveBtn} disabled={saving}>
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={styles.profileInfo}>
                  <h2 style={styles.profileName}>{user.name}</h2>
                  <p style={styles.profileEmail}>{user.email}</p>
                  {user.bio && <p style={styles.profileBio}>{user.bio}</p>}
                  {!user.bio && <p style={styles.noBio}>No bio yet — tell others about yourself!</p>}
                  <button onClick={() => setEditing(true)} style={styles.editBtn}>
                    ✎ Edit Profile
                  </button>
                </div>
              )}

              <div style={styles.statsRow}>
                <div style={styles.stat}>
                  <span style={styles.statNum}>{spots.length}</span>
                  <span style={styles.statLabel}>Spots Added</span>
                </div>
                <div style={styles.statDivider} />
                <div style={styles.stat}>
                  <span style={styles.statNum}>{joinDate}</span>
                  <span style={styles.statLabel}>Member Since</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right — My Spots */}
          <div style={styles.spotsSection}>
            <h2 style={styles.sectionTitle}>My Food Gems</h2>

            {loadingSpots ? (
              <div style={styles.spotsGrid}>
                {[1, 2, 3].map((n) => (
                  <div key={n} style={styles.skeletonCard}>
                    <div style={styles.skeletonImage} />
                    <div style={styles.skeletonBody}>
                      <div style={styles.skeletonLine} />
                      <div style={{ ...styles.skeletonLine, width: '60%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : spots.length === 0 ? (
              <div style={styles.emptySpots}>
                <p style={styles.emptyIcon}>🍽️</p>
                <h3 style={styles.emptyTitle}>No spots yet</h3>
                <p style={styles.emptyText}>You haven't added any food gems yet.</p>
                <Link to="/add-spot" style={styles.addBtn}>+ Share a Gem</Link>
              </div>
            ) : (
              <div style={{
                ...styles.spotsGrid,
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))',
              }}>
                {spots.map((spot) => (
                  <ProfileSpotCard
                    key={spot.id}
                    spot={spot}
                    onDelete={() => setDeleteTarget(spot)}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

function ProfileSpotCard({ spot, onDelete }) {
  const primaryPhoto = spot.photos?.find(p => p.isPrimary) || spot.photos?.[0];

  return (
    <div style={styles.spotCard}>
      <Link to={`/spots/${spot.id}`} style={{ textDecoration: 'none' }}>
        {primaryPhoto ? (
          <div style={styles.spotImageWrapper}>
            <img src={primaryPhoto.url} alt={spot.name} style={styles.spotImage} />
            <span style={styles.spotBadge}>{spot.category}</span>
          </div>
        ) : (
          <div style={styles.spotImagePlaceholder}>
            <span style={{ fontSize: '40px' }}>🍽️</span>
            <span style={styles.spotBadge}>{spot.category}</span>
          </div>
        )}
        <div style={styles.spotCardBody}>
          <h3 style={styles.spotName}>{spot.name}</h3>
          <p style={styles.spotCity}>📍 {spot.city}</p>
          <div style={styles.spotFooter}>
            <span style={styles.spotRating}>
              ⭐ {spot.avgRating > 0 ? spot.avgRating.toFixed(1) : 'New'}
            </span>
            <span style={styles.spotReviews}>
              {spot.reviews?.length || 0} review{spot.reviews?.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </Link>

      {/* Edit / Delete actions */}
      <div style={styles.cardActions}>
        <Link to={`/edit-spot/${spot.id}`} style={styles.cardEditBtn}>
          ✎ Edit
        </Link>
        <button onClick={onDelete} style={styles.cardDeleteBtn}>
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    backgroundColor: 'var(--cream)',
    minHeight: 'calc(100vh - 68px)',
  },
  // Delete dialog
  dialogOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    padding: '20px',
  },
  dialog: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '36px 32px',
    maxWidth: '420px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  dialogIcon: { fontSize: '40px', marginBottom: '12px' },
  dialogTitle: {
    fontSize: '22px',
    color: 'var(--dark)',
    fontFamily: 'Playfair Display, serif',
    marginBottom: '12px',
  },
  dialogText: {
    color: 'var(--text-light)',
    fontSize: '15px',
    lineHeight: '1.6',
    marginBottom: '28px',
  },
  dialogBtns: { display: 'flex', gap: '12px' },
  dialogCancelBtn: {
    flex: 1,
    padding: '12px',
    backgroundColor: 'transparent',
    border: '1.5px solid var(--cream-dark)',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--text-light)',
    cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
  },
  dialogDeleteBtn: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#dc2626',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    color: 'white',
    cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
  },
  banner: {
    background: 'linear-gradient(135deg, var(--dark) 0%, #2D1B69 100%)',
    padding: '40px 24px 80px',
    position: 'relative',
    overflow: 'hidden',
  },
  bannerInner: {
    maxWidth: '1100px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 2,
  },
  backLink: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '14px',
    textDecoration: 'none',
  },
  circle1: {
    position: 'absolute',
    top: '-60px',
    right: '-60px',
    width: '260px',
    height: '260px',
    borderRadius: '50%',
    backgroundColor: 'rgba(232,116,26,0.12)',
    zIndex: 1,
  },
  circle2: {
    position: 'absolute',
    bottom: '-80px',
    left: '-40px',
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    backgroundColor: 'rgba(232,116,26,0.07)',
    zIndex: 1,
  },
  main: {
    maxWidth: '1100px',
    margin: '-50px auto 0',
    padding: '0 24px 60px',
    position: 'relative',
    zIndex: 3,
  },
  layout: {
    display: 'flex',
    gap: '28px',
    alignItems: 'flex-start',
  },
  sidebar: { width: '300px', flexShrink: 0 },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '32px 24px',
    boxShadow: 'var(--shadow-md)',
    textAlign: 'center',
  },
  avatarWrapper: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: '700',
    fontFamily: 'Playfair Display, serif',
    boxShadow: '0 4px 16px rgba(232,116,26,0.3)',
  },
  profileInfo: { marginBottom: '24px' },
  profileName: {
    fontSize: '22px',
    color: 'var(--dark)',
    fontFamily: 'Playfair Display, serif',
    marginBottom: '6px',
  },
  profileEmail: {
    color: 'var(--text-light)',
    fontSize: '14px',
    marginBottom: '12px',
  },
  profileBio: {
    color: '#555',
    fontSize: '14px',
    lineHeight: '1.6',
    marginBottom: '16px',
  },
  noBio: {
    color: '#bbb',
    fontSize: '13px',
    fontStyle: 'italic',
    marginBottom: '16px',
  },
  editBtn: {
    backgroundColor: 'transparent',
    border: '1.5px solid var(--primary)',
    color: 'var(--primary)',
    padding: '8px 20px',
    borderRadius: '100px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
  },
  editForm: { textAlign: 'left', marginBottom: '24px' },
  field: { marginBottom: '16px' },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text)',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '2px solid var(--cream-dark)',
    borderRadius: '10px',
    fontSize: '14px',
    color: 'var(--text)',
    backgroundColor: 'var(--cream)',
    boxSizing: 'border-box',
    outline: 'none',
    fontFamily: 'DM Sans, sans-serif',
  },
  textarea: {
    width: '100%',
    padding: '10px 14px',
    border: '2px solid var(--cream-dark)',
    borderRadius: '10px',
    fontSize: '14px',
    color: 'var(--text)',
    backgroundColor: 'var(--cream)',
    boxSizing: 'border-box',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'DM Sans, sans-serif',
  },
  editBtns: { display: 'flex', gap: '10px' },
  cancelBtn: {
    flex: 1,
    padding: '10px',
    backgroundColor: 'transparent',
    border: '1.5px solid var(--cream-dark)',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-light)',
    cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
  },
  saveBtn: {
    flex: 1,
    padding: '10px',
    backgroundColor: 'var(--primary)',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'white',
    cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    paddingTop: '20px',
    borderTop: '1px solid var(--cream-dark)',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  statNum: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--dark)',
    fontFamily: 'Playfair Display, serif',
  },
  statLabel: {
    fontSize: '11px',
    color: 'var(--text-light)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statDivider: {
    width: '1px',
    height: '32px',
    backgroundColor: 'var(--cream-dark)',
  },
  spotsSection: { flex: 1, minWidth: 0 },
  sectionTitle: {
    fontSize: '24px',
    color: 'var(--dark)',
    fontFamily: 'Playfair Display, serif',
    marginBottom: '20px',
  },
  spotsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '20px',
  },
  spotCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-sm)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  spotImageWrapper: {
    position: 'relative',
    height: '180px',
    overflow: 'hidden',
  },
  spotImage: { width: '100%', height: '100%', objectFit: 'cover' },
  spotImagePlaceholder: {
    height: '180px',
    backgroundColor: 'var(--cream-dark)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  spotBadge: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    backgroundColor: 'var(--primary)',
    color: 'white',
    padding: '3px 10px',
    borderRadius: '100px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  spotCardBody: { padding: '16px' },
  spotName: {
    fontSize: '16px',
    color: 'var(--dark)',
    fontFamily: 'Playfair Display, serif',
    marginBottom: '6px',
  },
  spotCity: { color: 'var(--text-light)', fontSize: '13px', marginBottom: '10px' },
  spotFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '10px',
    borderTop: '1px solid var(--cream-dark)',
  },
  spotRating: { fontSize: '13px', fontWeight: '600', color: 'var(--text)' },
  spotReviews: { fontSize: '12px', color: 'var(--text-light)' },
  // Edit/Delete action row on cards
  cardActions: {
    display: 'flex',
    borderTop: '1px solid var(--cream-dark)',
  },
  cardEditBtn: {
    flex: 1,
    padding: '10px',
    textAlign: 'center',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--primary)',
    textDecoration: 'none',
    borderRight: '1px solid var(--cream-dark)',
    fontFamily: 'DM Sans, sans-serif',
  },
  cardDeleteBtn: {
    flex: 1,
    padding: '10px',
    textAlign: 'center',
    fontSize: '13px',
    fontWeight: '600',
    color: '#dc2626',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
  },
  emptySpots: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: 'var(--shadow-sm)',
  },
  emptyIcon: { fontSize: '48px', marginBottom: '16px' },
  emptyTitle: {
    fontSize: '20px',
    color: 'var(--dark)',
    marginBottom: '8px',
    fontFamily: 'Playfair Display, serif',
  },
  emptyText: { color: 'var(--text-light)', marginBottom: '20px', fontSize: '15px' },
  addBtn: {
    display: 'inline-block',
    backgroundColor: 'var(--primary)',
    color: 'white',
    padding: '10px 24px',
    borderRadius: '100px',
    fontWeight: '600',
    textDecoration: 'none',
    fontSize: '14px',
  },
  skeletonCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-sm)',
  },
  skeletonImage: {
    height: '180px',
    backgroundColor: 'var(--cream-dark)',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  skeletonBody: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  skeletonLine: {
    height: '14px',
    backgroundColor: 'var(--cream-dark)',
    borderRadius: '6px',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
};

export default Profile;