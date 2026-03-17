import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isLoggedIn = !!token;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setMenuOpen(false);
    navigate('/login');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {/* Logo */}
        <Link to="/" style={styles.logo} onClick={closeMenu}>
          <span style={styles.logoIcon}>🍜</span>
          <span style={styles.logoText}>
            Food<span style={styles.logoAccent}>Gems</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="nav-desktop">
          <Link to="/" style={styles.link}>Explore</Link>
          {isLoggedIn ? (
            <>
              <Link to="/add-spot" style={styles.addBtn}>+ Add Spot</Link>
              <Link to="/profile" style={styles.userNameLink}>
                Hi, {user?.name}! 👋
              </Link>
              <button onClick={handleLogout} style={styles.logoutBtn}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.link}>Login</Link>
              <Link to="/register" style={styles.registerBtn}>Join Free</Link>
            </>
          )}
        </div>

        {/* Hamburger Button */}
        <button
          className="nav-hamburger"
          style={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          <Link to="/" style={styles.mobileLink} onClick={closeMenu}>
            🏠 Explore
          </Link>
          {isLoggedIn ? (
            <>
              <Link to="/add-spot" style={styles.mobileLink} onClick={closeMenu}>
                ➕ Add Spot
              </Link>
              <Link to="/profile" style={styles.mobileLink} onClick={closeMenu}>
                👤 My Profile
              </Link>
              <div style={styles.mobileDivider} />
              <span style={styles.mobileUser}>👋 Hi, {user?.name}!</span>
              <button onClick={handleLogout} style={styles.mobileLogoutBtn}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.mobileLink} onClick={closeMenu}>
                🔑 Login
              </Link>
              <Link to="/register" style={styles.mobileRegisterBtn} onClick={closeMenu}>
                Join Free
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

const styles = {
  nav: {
    backgroundColor: 'var(--dark)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 20px rgba(0,0,0,0.3)',
  },
  inner: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '68px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
  },
  logoIcon: {
    fontSize: '28px',
  },
  logoText: {
    fontSize: '22px',
    fontWeight: '700',
    color: 'white',
    fontFamily: 'Playfair Display, serif',
    letterSpacing: '-0.5px',
  },
  logoAccent: {
    color: 'var(--primary)',
  },
  link: {
    color: 'rgba(255,255,255,0.8)',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '500',
  },
  addBtn: {
    backgroundColor: 'var(--primary)',
    color: 'white',
    padding: '8px 20px',
    borderRadius: '100px',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
  },
  registerBtn: {
    backgroundColor: 'var(--primary)',
    color: 'white',
    padding: '8px 20px',
    borderRadius: '100px',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
  },
  userNameLink: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '14px',
    textDecoration: 'none',
    cursor: 'pointer',
    borderBottom: '1px dashed rgba(255,255,255,0.3)',
    paddingBottom: '1px',
  },
  logoutBtn: {
    backgroundColor: 'transparent',
    border: '1px solid rgba(255,255,255,0.3)',
    color: 'rgba(255,255,255,0.8)',
    padding: '6px 16px',
    borderRadius: '100px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  hamburger: {
    display: 'none',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '4px 8px',
  },
  mobileMenu: {
    display: 'flex',
    flexDirection: 'column',
    padding: '16px 24px 24px',
    gap: '4px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  mobileLink: {
    color: 'rgba(255,255,255,0.85)',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '500',
    padding: '12px 0',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  mobileDivider: {
    height: '1px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    margin: '8px 0',
  },
  mobileUser: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '14px',
    padding: '8px 0',
  },
  mobileLogoutBtn: {
    backgroundColor: 'transparent',
    border: '1px solid rgba(255,255,255,0.3)',
    color: 'rgba(255,255,255,0.8)',
    padding: '10px 16px',
    borderRadius: '100px',
    fontSize: '14px',
    cursor: 'pointer',
    marginTop: '8px',
    fontFamily: 'DM Sans, sans-serif',
    width: '100%',
  },
  mobileRegisterBtn: {
    display: 'block',
    backgroundColor: 'var(--primary)',
    color: 'white',
    padding: '12px 20px',
    borderRadius: '100px',
    fontSize: '15px',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center',
    marginTop: '8px',
  },
};

export default Navbar;