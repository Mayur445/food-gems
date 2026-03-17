import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllSpots } from '../api/spots';
import SkeletonCard from '../components/SkeletonCard';
import Map from '../components/Map';

const CATEGORIES = [
  'All', 'Street Food', 'Tea Stall', 'Cafe',
  'Restaurant', 'Bakery', 'Juice Shop', 'Biryani', 'Sweets'
];

const PRICE_RANGES = [
  { value: '', label: 'Any Price' },
  { value: 'cheap', label: '💰 Budget' },
  { value: 'moderate', label: '💰💰 Moderate' },
  { value: 'expensive', label: '💰💰💰 Premium' },
];

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
}

function Home() {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [view, setView] = useState('grid');

  const width = useWindowWidth();
  const isMobile = width <= 768;
  const isSmall = width <= 480;

  const fetchSpots = async (filters = {}) => {
    setLoading(true);
    try {
      const data = await getAllSpots(filters);
      setSpots(data.data);
    } catch (err) {
      console.error('Failed to load spots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpots();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSpots({ search, category, priceRange });
    }, 400);
    return () => clearTimeout(timer);
  }, [search, category, priceRange]);

  const handleSearch = (e) => {
    setSearchInput(e.target.value);
    setSearch(e.target.value);
  };

  const handleCategoryClick = (cat) => {
    setCategory(cat === 'All' ? '' : cat);
  };

  return (
    <div>
      {/* Hero Section */}
      <div style={{
        ...styles.hero,
        padding: isSmall ? '40px 16px 60px' : isMobile ? '50px 20px 70px' : '80px 24px 100px',
      }}>
        <div style={styles.heroInner}>
          <p style={styles.heroTag}>✦ Community Powered</p>
          <h1 style={{
            ...styles.heroTitle,
            fontSize: isSmall ? '26px' : isMobile ? '34px' : '52px',
          }}>
            Find Hidden Food<br />
            <span style={styles.heroAccent}>Gems Near You</span>
          </h1>
          <p style={{
            ...styles.heroSubtitle,
            fontSize: isSmall ? '14px' : isMobile ? '15px' : '18px',
            marginBottom: isMobile ? '24px' : '36px',
          }}>
            Real spots. Real food. Shared by real travelers.
          </p>

          {/* Search Bar */}
          <div style={styles.searchBar}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder={isMobile ? 'Search spots...' : 'Search by name, city or description...'}
              value={searchInput}
              onChange={handleSearch}
              style={styles.searchInput}
            />
            {searchInput && (
              <button
                onClick={() => { setSearchInput(''); setSearch(''); }}
                style={styles.clearBtn}
              >✕</button>
            )}
          </div>
        </div>
        <div style={styles.circle1} />
        <div style={styles.circle2} />
      </div>

      {/* Main Content */}
      <div style={{
        ...styles.main,
        padding: isSmall ? '0 12px 32px' : isMobile ? '0 16px 40px' : '0 24px 60px',
        marginTop: isMobile ? '-30px' : '-40px',
      }}>

        {/* Filters Row */}
        <div style={{
          ...styles.filtersRow,
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: isMobile ? '12px' : '16px',
          padding: isMobile ? '14px 16px' : '16px 20px',
        }}>
          <div style={{
            ...styles.categoryPills,
            flexWrap: isMobile ? 'nowrap' : 'wrap',
            overflowX: isMobile ? 'auto' : 'visible',
            paddingBottom: isMobile ? '4px' : '0',
            WebkitOverflowScrolling: 'touch',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                style={{
                  ...styles.pill,
                  ...(
                    (cat === 'All' && !category) || category === cat
                      ? styles.pillActive
                      : {}
                  )
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            style={{
              ...styles.priceSelect,
              width: isMobile ? '100%' : 'auto',
            }}
          >
            {PRICE_RANGES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        {/* Results Row */}
        <div style={{
          ...styles.resultsRow,
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: isMobile ? '10px' : '0',
        }}>
          <p style={styles.resultsCount}>
            {loading ? 'Searching...' : `${spots.length} spot${spots.length !== 1 ? 's' : ''} found`}
          </p>
          <div style={{
            ...styles.resultsRight,
            width: isMobile ? '100%' : 'auto',
            justifyContent: isMobile ? 'space-between' : 'flex-end',
          }}>
            <div style={styles.viewToggle}>
              <button
                onClick={() => setView('grid')}
                style={{
                  ...styles.toggleBtn,
                  ...(view === 'grid' ? styles.toggleBtnActive : {})
                }}
              >
                ▦ Grid
              </button>
              <button
                onClick={() => setView('map')}
                style={{
                  ...styles.toggleBtn,
                  ...(view === 'map' ? styles.toggleBtnActive : {})
                }}
              >
                🗺️ Map
              </button>
            </div>
            <Link to="/add-spot" style={styles.addSpotLink}>+ Share a Gem</Link>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{
            ...styles.grid,
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
          }}>
            {[1, 2, 3, 4, 5, 6].map((n) => <SkeletonCard key={n} />)}
          </div>
        ) : spots.length === 0 ? (
          <div style={styles.empty}>
            <p style={styles.emptyIcon}>🍽️</p>
            <h3 style={styles.emptyTitle}>No spots found</h3>
            <p style={styles.emptyText}>Try a different search or be the first to add one!</p>
            <Link to="/add-spot" style={styles.emptyBtn}>Add a Spot</Link>
          </div>
        ) : view === 'map' ? (
          <div style={{
            ...styles.mapWrapper,
            height: isMobile ? '420px' : '600px',
          }}>
            <Map spots={spots} />
          </div>
        ) : (
          <div style={{
            ...styles.grid,
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
          }}>
            {spots.map((spot) => (
              <SpotCard key={spot.id} spot={spot} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SpotCard({ spot }) {
  return (
    <Link to={`/spots/${spot.id}`} style={{ textDecoration: 'none' }}>
      <div style={styles.card}>
        {spot.photos && spot.photos.length > 0 ? (
          <div style={styles.cardImageWrapper}>
            <img src={spot.photos[0].url} alt={spot.name} style={styles.cardImage} />
            <div style={styles.cardImageOverlay} />
            <span style={styles.cardCategoryBadge}>{spot.category}</span>
          </div>
        ) : (
          <div style={styles.cardImagePlaceholder}>
            <span style={styles.placeholderIcon}>🍽️</span>
            <span style={styles.cardCategoryBadge}>{spot.category}</span>
          </div>
        )}

        <div style={styles.cardBody}>
          <div style={styles.cardTop}>
            <h3 style={styles.cardTitle}>{spot.name}</h3>
            <div style={styles.cardRating}>
              <span>⭐</span>
              <span style={styles.cardRatingText}>
                {spot.avgRating > 0 ? spot.avgRating.toFixed(1) : 'New'}
              </span>
            </div>
          </div>
          <p style={styles.cardCity}>📍 {spot.city}</p>
          <p style={styles.cardDesc}>{spot.description}</p>
          <div style={styles.cardFooter}>
            <span style={styles.cardPrice}>
              {spot.priceRange === 'cheap' ? '💰 Budget' :
               spot.priceRange === 'moderate' ? '💰💰 Moderate' : '💰💰💰 Premium'}
            </span>
            <span style={styles.cardAuthor}>by {spot.user?.name}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

const styles = {
  hero: {
    background: 'linear-gradient(135deg, var(--dark) 0%, #2D1B69 100%)',
    padding: '80px 24px 100px',
    position: 'relative',
    overflow: 'hidden',
  },
  heroInner: {
    maxWidth: '700px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 2,
    textAlign: 'center',
  },
  heroTag: {
    color: 'var(--primary)',
    fontSize: '13px',
    fontWeight: '600',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    marginBottom: '16px',
  },
  heroTitle: {
    fontSize: '52px',
    color: 'white',
    lineHeight: '1.2',
    marginBottom: '16px',
    fontFamily: 'Playfair Display, serif',
  },
  heroAccent: {
    color: 'var(--primary)',
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: '18px',
    marginBottom: '36px',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: '100px',
    padding: '6px 6px 6px 20px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    gap: '8px',
  },
  searchIcon: {
    fontSize: '18px',
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '16px',
    color: 'var(--text)',
    backgroundColor: 'transparent',
    padding: '8px 0',
    minWidth: 0,
  },
  clearBtn: {
    backgroundColor: '#e0d8d0',
    border: 'none',
    borderRadius: '100px',
    width: '28px',
    height: '28px',
    cursor: 'pointer',
    fontSize: '12px',
    color: '#666',
    flexShrink: 0,
  },
  circle1: {
    position: 'absolute',
    top: '-80px',
    right: '-80px',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    backgroundColor: 'rgba(232,116,26,0.15)',
    zIndex: 1,
  },
  circle2: {
    position: 'absolute',
    bottom: '-100px',
    left: '-60px',
    width: '250px',
    height: '250px',
    borderRadius: '50%',
    backgroundColor: 'rgba(232,116,26,0.08)',
    zIndex: 1,
  },
  main: {
    maxWidth: '1200px',
    margin: '-40px auto 0',
    padding: '0 24px 60px',
    position: 'relative',
    zIndex: 3,
  },
  filtersRow: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '16px 20px',
    boxShadow: 'var(--shadow-md)',
    marginBottom: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
  },
  categoryPills: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  pill: {
    padding: '6px 16px',
    borderRadius: '100px',
    border: '1.5px solid #e0d8d0',
    backgroundColor: 'transparent',
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--text-light)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'DM Sans, sans-serif',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  pillActive: {
    backgroundColor: 'var(--primary)',
    borderColor: 'var(--primary)',
    color: 'white',
  },
  priceSelect: {
    padding: '8px 16px',
    borderRadius: '100px',
    border: '1.5px solid #e0d8d0',
    backgroundColor: 'transparent',
    fontSize: '13px',
    color: 'var(--text)',
    cursor: 'pointer',
    outline: 'none',
    flexShrink: 0,
  },
  resultsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  resultsCount: {
    color: 'var(--text-light)',
    fontSize: '14px',
    fontWeight: '500',
  },
  resultsRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  viewToggle: {
    display: 'flex',
    backgroundColor: 'white',
    borderRadius: '100px',
    padding: '4px',
    boxShadow: 'var(--shadow-sm)',
    gap: '4px',
  },
  toggleBtn: {
    padding: '6px 16px',
    borderRadius: '100px',
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--text-light)',
    cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif',
  },
  toggleBtnActive: {
    backgroundColor: 'var(--primary)',
    color: 'white',
  },
  addSpotLink: {
    color: 'var(--primary)',
    fontWeight: '600',
    fontSize: '14px',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  },
  mapWrapper: {
    height: '600px',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-md)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-sm)',
    transition: 'transform 0.25s, box-shadow 0.25s',
    cursor: 'pointer',
  },
  cardImageWrapper: {
    position: 'relative',
    height: '210px',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.4s',
  },
  cardImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60px',
    background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)',
  },
  cardCategoryBadge: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    backgroundColor: 'var(--primary)',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '100px',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  cardImagePlaceholder: {
    height: '210px',
    backgroundColor: 'var(--cream-dark)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  placeholderIcon: {
    fontSize: '52px',
  },
  cardBody: {
    padding: '18px',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '6px',
  },
  cardTitle: {
    fontSize: '17px',
    color: 'var(--dark)',
    fontFamily: 'Playfair Display, serif',
    flex: 1,
    paddingRight: '8px',
  },
  cardRating: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    backgroundColor: 'var(--cream)',
    padding: '3px 10px',
    borderRadius: '100px',
    flexShrink: 0,
  },
  cardRatingText: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text)',
  },
  cardCity: {
    color: 'var(--text-light)',
    fontSize: '13px',
    marginBottom: '8px',
  },
  cardDesc: {
    color: '#555',
    fontSize: '14px',
    lineHeight: '1.5',
    marginBottom: '14px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '12px',
    borderTop: '1px solid var(--cream-dark)',
  },
  cardPrice: {
    fontSize: '13px',
    color: 'var(--text-light)',
    fontWeight: '500',
  },
  cardAuthor: {
    fontSize: '12px',
    color: '#aaa',
  },
  empty: {
    textAlign: 'center',
    padding: '80px 20px',
    backgroundColor: 'white',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow-sm)',
  },
  emptyIcon: {
    fontSize: '52px',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '22px',
    color: 'var(--dark)',
    marginBottom: '8px',
    fontFamily: 'Playfair Display, serif',
  },
  emptyText: {
    color: 'var(--text-light)',
    marginBottom: '24px',
  },
  emptyBtn: {
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

export default Home;