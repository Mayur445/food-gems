import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/auth';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await register({ name, email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.data));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
          <div style={styles.badge}>✦ Join the Community</div>
          <h1 style={styles.title} className="split-left-title">Start your food<br />adventure today.</h1>
          <p style={styles.subtitle} className="split-left-subtitle">
            Create a free account and start sharing hidden food gems with travelers around the world.
          </p>
          <div style={styles.features} className="split-left-extras">
            {[
              '🗺️ Discover spots on an interactive map',
              '📸 Share photos of amazing food',
              '⭐ Review and rate hidden gems',
              '🌍 Connect with fellow food travelers',
            ].map((f, i) => (
              <div key={i} style={styles.feature}>{f}</div>
            ))}
          </div>
        </div>
        <div style={styles.circle1} />
        <div style={styles.circle2} />
      </div>

      {/* Right Panel */}
      <div style={styles.right} className="split-right">
        <div style={styles.card} className="split-card">
          <h2 style={styles.cardTitle}>Create Account</h2>
          <p style={styles.cardSubtitle}>It's free and takes less than a minute</p>

          {error && (
            <div style={styles.errorBox}>⚠️ {error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={styles.field}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
                placeholder="Your full name"
                required
              />
            </div>

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
                placeholder="Choose a strong password"
                required
              />
            </div>

            <button
              type="submit"
              style={styles.button}
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <p style={styles.terms}>
            By registering you agree to our terms of service.
          </p>

          <p style={styles.footer}>
            Already have an account?{' '}
            <Link to="/login" style={styles.footerLink}>Sign in here</Link>
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
    background: 'linear-gradient(135deg, #1a2a1a 0%, #2D3B1B 100%)',
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
    marginBottom: '32px',
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  feature: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  circle1: {
    position: 'absolute',
    top: '-100px',
    right: '-100px',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    backgroundColor: 'rgba(232,116,26,0.08)',
    zIndex: 1,
  },
  circle2: {
    position: 'absolute',
    bottom: '-80px',
    left: '-80px',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    backgroundColor: 'rgba(232,116,26,0.05)',
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
    marginBottom: '18px',
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
  },
  terms: {
    textAlign: 'center',
    marginTop: '16px',
    color: '#bbb',
    fontSize: '12px',
  },
  footer: {
    textAlign: 'center',
    marginTop: '16px',
    color: 'var(--text-light)',
    fontSize: '14px',
  },
  footerLink: {
    color: 'var(--primary)',
    fontWeight: '600',
    textDecoration: 'none',
  },
};

export default Register;
