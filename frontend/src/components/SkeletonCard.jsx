function SkeletonCard() {
  return (
    <div style={styles.card}>
      <div style={styles.image} className="skeleton" />
      <div style={styles.body}>
        <div style={{ ...styles.line, width: '70%' }} className="skeleton" />
        <div style={{ ...styles.line, width: '40%', height: '12px' }} className="skeleton" />
        <div style={{ ...styles.line, width: '90%', height: '12px' }} className="skeleton" />
        <div style={{ ...styles.line, width: '60%', height: '12px' }} className="skeleton" />
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  image: {
    width: '100%',
    height: '200px',
    backgroundColor: '#e8e0d8',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  body: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  line: {
    height: '16px',
    backgroundColor: '#e8e0d8',
    borderRadius: '6px',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
};

export default SkeletonCard;