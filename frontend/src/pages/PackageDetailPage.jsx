import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../utils/api';
import GraphCanvas from '../components/GraphCanvas';
import VulnerabilityBadge from '../components/VulnerabilityBadge';
import SkeletonLoader from '../components/SkeletonLoader';

export default function PackageDetailPage() {
  const { name } = useParams();
  const [pkg, setPkg] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [graphLoading, setGraphLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setGraphLoading(true);
    setError(null);

    api.getPackage(name)
      .then(data => {
        setPkg(data.package);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });

    api.getPackageGraph(name)
      .then(data => {
        setGraphData(data);
        setGraphLoading(false);
      })
      .catch(() => {
        setGraphData({ nodes: [], links: [] });
        setGraphLoading(false);
      });
  }, [name]);

  if (error) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-state-icon">😕</div>
          <div className="empty-state-title">Package not found</div>
          <div className="empty-state-desc">{error}</div>
          <Link to="/" className="btn btn-primary">← Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-layout">
      {/* Sidebar */}
      <div className="detail-sidebar">
        {loading ? (
          <SkeletonLoader type="detail" />
        ) : pkg && (
          <div className="animate-fade-in">
            <div className="detail-pkg-name">{pkg.name}</div>
            <div className="detail-pkg-version">v{pkg.latest_version}</div>
            <p className="detail-pkg-desc">{pkg.description || 'No description available.'}</p>

            {/* Maintainers */}
            {pkg.maintainers?.length > 0 && (
              <div className="detail-section">
                <div className="detail-section-title">👤 Maintainers</div>
                <div className="detail-dep-list">
                  {pkg.maintainers.map(m => (
                    <span key={m} className="badge badge-muted">{m}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Dependencies */}
            {pkg.dependencies?.length > 0 && (
              <div className="detail-section">
                <div className="detail-section-title">
                  📦 Dependencies ({pkg.dependencies.length})
                </div>
                <div className="detail-dep-list">
                  {pkg.dependencies.map(dep => (
                    <Link
                      key={dep}
                      to={`/package/${encodeURIComponent(dep)}`}
                      className="detail-dep-chip"
                    >
                      {dep}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Vulnerabilities */}
            {pkg.vulnerabilities?.length > 0 && (
              <div className="detail-section">
                <div className="detail-section-title">🛡️ Vulnerabilities</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {pkg.vulnerabilities.map(v => (
                    <div
                      key={v.cve_id}
                      className="card"
                      style={{ padding: 'var(--space-3) var(--space-4)' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: '4px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)' }}>
                          {v.cve_id}
                        </span>
                        <VulnerabilityBadge severity={v.severity} />
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                        {v.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="detail-section">
              <Link
                to={`/blast-radius?package=${encodeURIComponent(pkg.name)}`}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                💥 View Blast Radius
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Graph */}
      <div className="detail-graph">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)' }}>Dependency Graph</h3>
          <span className="badge badge-muted">
            {graphData?.nodes?.length || 0} nodes • {graphData?.links?.length || 0} edges
          </span>
        </div>
        {graphLoading ? (
          <SkeletonLoader type="graph" />
        ) : (
          <GraphCanvas
            graphData={graphData}
            onNodeClick={(node) => {
              if (node.id !== name) {
                window.location.href = `/package/${encodeURIComponent(node.id)}`;
              }
            }}
            legendItems={[
              { color: '#6366F1', label: 'Root package' },
              { color: '#818CF8', label: 'Direct dependency' },
              { color: '#C7D2FE', label: 'Transitive dependency' },
            ]}
          />
        )}
      </div>
    </div>
  );
}
