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
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <Link to="/" style={styles.logo}>
          <span style={styles.logoIcon}>🍜</span>
          <span style={styles.logoText}>Food<span style={styles.logoAccent}>Gems</span></span>
        </Link>

        <div style={styles.links}>
          <Link to="/" style={styles.link}>Explore</Link>

          {isLoggedIn ? (
            <>
              <Link to="/add-spot" style={styles.addBtn}>+ Add Spot</Link>
              <div style={styles.userMenu}>
                <span style={styles.userName}>Hi, {user?.name}! 👋</span>
                <button onClick={handleLogout} style={styles.logoutBtn}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.link}>Login</Link>
              <Link to="/register" style={styles.registerBtn}>Join Free</Link>
            </>
          )}
        </div>
      </div>
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
    color: 'var(--white)',
    fontFamily: 'Playfair Display, serif',
    letterSpacing: '-0.5px',
  },
  logoAccent: {
    color: 'var(--primary)',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '28px',
  },
  link: {
    color: 'rgba(255,255,255,0.8)',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '500',
    transition: 'color 0.2s',
  },
  addBtn: {
    backgroundColor: 'var(--primary)',
    color: 'var(--white)',
    padding: '8px 20px',
    borderRadius: '100px',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'background 0.2s',
  },
  registerBtn: {
    backgroundColor: 'var(--primary)',
    color: 'var(--white)',
    padding: '8px 20px',
    borderRadius: '100px',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
  },
  userMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userName: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '14px',
  },
  logoutBtn: {
    backgroundColor: 'transparent',
    border: '1px solid rgba(255,255,255,0.3)',
    color: 'rgba(255,255,255,0.8)',
    padding: '6px 16px',
    borderRadius: '100px',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

export default Navbar;