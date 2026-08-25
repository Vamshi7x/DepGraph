export default function SkeletonLoader({ type = 'card', count = 3 }) {
  if (type === 'card') {
    return (
      <div className="home-packages-grid">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="card" style={{ animation: `fadeIn 0.3s ease ${i * 100}ms both` }}>
            <div className="skeleton skeleton-text" style={{ width: '60%', height: '1.2em' }}></div>
            <div className="skeleton skeleton-text short" style={{ marginTop: '0.5rem' }}></div>
            <div className="skeleton skeleton-text" style={{ marginTop: '1rem' }}></div>
            <div className="skeleton skeleton-text shorter"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'detail') {
    return (
      <div style={{ padding: 'var(--space-6)' }}>
        <div className="skeleton" style={{ width: '50%', height: '2em', marginBottom: '1rem' }}></div>
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-text short"></div>
        <div style={{ marginTop: '2rem' }}>
          <div className="skeleton" style={{ width: '30%', height: '1em', marginBottom: '1rem' }}></div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ width: '80px', height: '28px', borderRadius: '9999px' }}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'graph') {
    return (
      <div className="graph-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner spinner-lg" style={{ margin: '0 auto 1rem' }}></div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Loading graph...</div>
        </div>
      </div>
    );
  }

  return null;
}
