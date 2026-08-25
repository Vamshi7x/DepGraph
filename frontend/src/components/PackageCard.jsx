import { useNavigate } from 'react-router-dom';

export default function PackageCard({ pkg }) {
  const navigate = useNavigate();

  return (
    <div
      className="card card-clickable"
      onClick={() => navigate(`/package/${encodeURIComponent(pkg.name)}`)}
      id={`pkg-card-${pkg.name}`}
    >
      <div className="card-header">
        <div>
          <div className="card-title">📦 {pkg.name}</div>
          {pkg.latest_version && (
            <div className="card-subtitle" style={{ fontFamily: 'var(--font-mono)' }}>
              v{pkg.latest_version}
            </div>
          )}
        </div>
        {pkg.depCount !== undefined && (
          <span className="badge badge-accent">{pkg.depCount} deps</span>
        )}
      </div>
      {pkg.description && (
        <div className="card-body">
          {pkg.description.length > 120
            ? pkg.description.slice(0, 120) + '…'
            : pkg.description}
        </div>
      )}
      <div className="card-footer">
        <span className="badge badge-muted">{pkg.ecosystem || 'npm'}</span>
        <span style={{ marginLeft: 'auto', fontSize: 'var(--text-xs)', color: 'var(--color-accent)' }}>
          Explore →
        </span>
      </div>
    </div>
  );
}
