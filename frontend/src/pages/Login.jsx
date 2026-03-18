import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login } from '../api/auth';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login({ email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.data));
      toast.success(`Welcome back, ${data.data.name}! 👋`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page} className="split-page">
      {/* Left Panel */}
      <div style={styles.left} className="split-left">
        <div style={styles.leftInner} className="split-left-inner">
          <Link to="/" style={styles.backLink}>← Back to Food Gems</Link>
          <div style={styles.badge}>🍜 Welcome Back</div>
          <h1 style={styles.title} className="split-left-title">Every city hides<br />a delicious secret.</h1>
          <p style={styles.subtitle} className="split-left-subtitle">Login to discover and share hidden food gems with travelers around the world.</p>
          <div style={styles.statsRow} className="split-left-extras">
            <div style={styles.stat}>
              <span style={styles.statNum}>100+</span>
              <span style={styles.statLabel}>Hidden Spots</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.stat}>
              <span style={styles.statNum}>50+</span>
              <span style={styles.statLabel}>Cities</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.stat}>
              <span style={styles.statNum}>200+</span>
              <span style={styles.statLabel}>Travelers</span>
            </div>
          </div>
        </div>
        <div style={styles.circle1} />
        <div style={styles.circle2} />
      </div>

      {/* Right Panel */}
      <div style={styles.right} className="split-right">
        <div style={styles.card} className="split-card">
          <h2 style={styles.cardTitle}>Sign In</h2>
          <p style={styles.cardSubtitle}>Enter your credentials to continue</p>

          <form onSubmit={handleSubmit}>
            <div style={styles.field}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                placeholder="you@example.com"
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                placeholder="Your password"
                required
              />
            </div>

            <button
              type="submit"
              style={styles.button}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <p style={styles.footer}>
            Don't have an account?{' '}
            <Link to="/register" style={styles.footerLink}>Create one free</Link>
          </p>
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
    flex: 1,
    background: 'linear-gradient(135deg, var(--dark) 0%, #2D1B69 100%)',
    padding: '60px',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  leftInner: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '420px',
  },
  backLink: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '14px',
    textDecoration: 'none',
    display: 'block',
    marginBottom: '40px',
  },
  badge: {
    display: 'inline-block',
    backgroundColor: 'rgba(232,116,26,0.2)',
    color: 'var(--primary)',
    padding: '6px 16px',
    borderRadius: '100px',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '24px',
    border: '1px solid rgba(232,116,26,0.3)',
  },
  title: {
    fontSize: '42px',
    color: 'white',
    lineHeight: '1.2',
    marginBottom: '16px',
    fontFamily: 'Playfair Display, serif',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '16px',
    lineHeight: '1.7',
    marginBottom: '40px',
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  statNum: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'white',
    fontFamily: 'Playfair Display, serif',
  },
  statLabel: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  statDivider: {
    width: '1px',
    height: '40px',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  circle1: {
    position: 'absolute',
    top: '-100px',
    right: '-100px',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    backgroundColor: 'rgba(232,116,26,0.1)',
    zIndex: 1,
  },
  circle2: {
    position: 'absolute',
    bottom: '-80px',
    left: '-80px',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    backgroundColor: 'rgba(232,116,26,0.06)',
    zIndex: 1,
  },
  right: {
    width: '480px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    backgroundColor: 'var(--cream)',
  },
  card: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: '24px',
    padding: '40px',
    boxShadow: 'var(--shadow-lg)',
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
  input: {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid var(--cream-dark)',
    borderRadius: '12px',
    fontSize: '15px',
    color: 'var(--text)',
    backgroundColor: 'var(--cream)',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  button: {
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
    transition: 'background 0.2s',
  },
  footer: {
    textAlign: 'center',
    marginTop: '24px',
    color: 'var(--text-light)',
    fontSize: '14px',
  },
  footerLink: {
    color: 'var(--primary)',
    fontWeight: '600',
    textDecoration: 'none',
  },
};

export default Login;