import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';
import SearchBar from '../components/SearchBar';
import GraphCanvas from '../components/GraphCanvas';
import SkeletonLoader from '../components/SkeletonLoader';

export default function BlastRadiusPage() {
  const [searchParams] = useSearchParams();
  const initialPackage = searchParams.get('package') || '';

  const [selectedPackage, setSelectedPackage] = useState(initialPackage);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedPackage) return;
    
    setLoading(true);
    setError(null);
    api.getBlastRadius(selectedPackage)
      .then(result => {
        setData(result);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [selectedPackage]);

  const highlightNodes = useMemo(() => {
    if (!data?.graph?.nodes) return new Set();
    return new Set(data.graph.nodes.map(n => n.id));
  }, [data]);

  return (
    <div className="blast-layout">
      {/* Sidebar */}
      <div className="blast-sidebar">
        <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>
          💥 Blast Radius
        </h2>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
          Select a package to see what breaks if it has a vulnerability.
        </p>

        <SearchBar
          placeholder="Pick a package to simulate..."
          onSelect={(pkg) => setSelectedPackage(pkg.name)}
        />

        {loading && (
          <div style={{ marginTop: 'var(--space-6)', textAlign: 'center' }}>
            <div className="spinner spinner-lg" style={{ margin: '0 auto 0.5rem' }}></div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              Calculating blast radius...
            </div>
          </div>
        )}

        {error && (
          <div style={{ marginTop: 'var(--space-4)', color: 'var(--color-critical)', fontSize: 'var(--text-sm)' }}>
            ❌ {error}
          </div>
        )}

        {data && !loading && (
          <div className="animate-fade-in" style={{ marginTop: 'var(--space-6)' }}>
            {/* Summary */}
            <div className="blast-summary">
              <div className="blast-summary-title">⚠️ Impact Assessment</div>
              <div className="blast-summary-count">
                {data.affectedCount} packages
              </div>
              <div className="blast-summary-desc">
                would be affected if <strong>{data.vulnerablePackage}</strong> had a critical vulnerability
              </div>
            </div>

            {/* Affected list */}
            <div className="sidebar-section">
              <div className="sidebar-section-title">
                Affected Packages ({data.affected?.length || 0})
              </div>
              <div className="sidebar-list">
                {data.affected?.map((item, i) => (
                  <div key={item.package} className="blast-affected-item" style={{ animationDelay: `${i * 30}ms` }}>
                    <div>
                      <div className="blast-affected-name">{item.package}</div>
                      {item.description && (
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          {item.description.slice(0, 60)}
                        </div>
                      )}
                    </div>
                    <span className={`hop-badge ${
                      item.hops === 1 ? 'hop-1' : 
                      item.hops === 2 ? 'hop-2' : 
                      item.hops === 3 ? 'hop-3' : 'hop-far'
                    }`}>
                      {item.hops}h
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!selectedPackage && !loading && (
          <div className="empty-state" style={{ padding: 'var(--space-10) 0' }}>
            <div className="empty-state-icon">🎯</div>
            <div className="empty-state-title">Pick a package</div>
            <div className="empty-state-desc">
              Search for a package above to see how many other packages would be
              affected if it went down.
            </div>
          </div>
        )}
      </div>

      {/* Graph */}
      <div className="blast-graph">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)' }}>
            {selectedPackage ? `Impact Graph — ${selectedPackage}` : 'Impact Graph'}
          </h3>
          {data?.graph && (
            <span className="badge badge-warning">
              {data.graph.nodes?.length || 0} nodes • {data.graph.links?.length || 0} edges
            </span>
          )}
        </div>
        {loading ? (
          <SkeletonLoader type="graph" />
        ) : (
          <GraphCanvas
            graphData={data?.graph || { nodes: [], links: [] }}
            highlightNodes={highlightNodes}
            onNodeClick={(node) => {
              if (node.id !== selectedPackage) {
                window.location.href = `/package/${encodeURIComponent(node.id)}`;
              }
            }}
            legendItems={[
              { color: '#EF4444', label: 'Vulnerable package' },
              { color: '#F59E0B', label: 'Affected (blast radius)' },
            ]}
          />
        )}
      </div>
    </div>
  );
}
