import { useState } from 'react';
import { api } from '../utils/api';
import SearchBar from '../components/SearchBar';
import PathDisplay from '../components/PathDisplay';

export default function ComparePage() {
  const [pkgA, setPkgA] = useState(null);
  const [pkgB, setPkgB] = useState(null);
  const [pathData, setPathData] = useState(null);
  const [sharedData, setSharedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function runComparison(a, b) {
    if (!a || !b) return;
    setLoading(true);
    setError(null);

    try {
      const [pathResult, sharedResult] = await Promise.all([
        api.getShortestPath(a, b).catch(() => ({ found: false, paths: [] })),
        api.getSharedDeps(a, b).catch(() => ({ shared: [], sharedCount: 0 })),
      ]);
      setPathData(pathResult);
      setSharedData(sharedResult);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectA(pkg) {
    setPkgA(pkg.name);
    if (pkgB) runComparison(pkg.name, pkgB);
  }

  function handleSelectB(pkg) {
    setPkgB(pkg.name);
    if (pkgA) runComparison(pkgA, pkg.name);
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">🔀 Compare Packages</h1>
        <p className="page-subtitle">
          Find the shortest dependency path between two packages and discover their shared dependencies.
        </p>
      </div>

      {/* Input Section */}
      <div className="compare-inputs">
        <div>
          <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', marginBottom: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>
            Package A
          </label>
          <SearchBar
            placeholder="Select first package..."
            onSelect={handleSelectA}
          />
          {pkgA && (
            <div className="badge badge-accent" style={{ marginTop: 'var(--space-2)' }}>
              📦 {pkgA}
            </div>
          )}
        </div>

        <div className="compare-vs">VS</div>

        <div>
          <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', marginBottom: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>
            Package B
          </label>
          <SearchBar
            placeholder="Select second package..."
            onSelect={handleSelectB}
          />
          {pkgB && (
            <div className="badge badge-accent" style={{ marginTop: 'var(--space-2)' }}>
              📦 {pkgB}
            </div>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
          <div className="spinner spinner-lg" style={{ margin: '0 auto 1rem' }}></div>
          <div style={{ color: 'var(--color-text-muted)' }}>Analyzing packages...</div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card" style={{ marginTop: 'var(--space-4)', borderColor: 'var(--color-critical)' }}>
          <p style={{ color: 'var(--color-critical)' }}>❌ {error}</p>
        </div>
      )}

      {/* Results */}
      {!loading && (pathData || sharedData) && (
        <div className="animate-fade-in-up">
          {/* Shortest Path */}
          <section className="compare-section">
            <h3 className="compare-section-title">
              🛤️ Shortest Dependency Path
            </h3>
            {pathData?.found ? (
              <div className="card">
                {pathData.paths.map((p, i) => (
                  <div key={i} style={{ marginBottom: i < pathData.paths.length - 1 ? 'var(--space-4)' : 0 }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
                      Path {i + 1} — {p.chain.length - 1} hops
                    </div>
                    <PathDisplay chain={p.chain} />
                  </div>
                ))}
              </div>
            ) : pathData ? (
              <div className="card">
                <div className="empty-state" style={{ padding: 'var(--space-6)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>🔌</div>
                  <div className="empty-state-title" style={{ fontSize: 'var(--text-base)' }}>No path found</div>
                  <div className="empty-state-desc">
                    There's no dependency chain between <strong>{pkgA}</strong> and <strong>{pkgB}</strong>
                  </div>
                </div>
              </div>
            ) : null}
          </section>

          {/* Shared Dependencies */}
          <section className="compare-section">
            <h3 className="compare-section-title">
              🤝 Shared Dependencies
              {sharedData?.sharedCount > 0 && (
                <span className="badge badge-accent" style={{ marginLeft: 'var(--space-2)' }}>
                  {sharedData.sharedCount}
                </span>
              )}
            </h3>
            {sharedData?.shared?.length > 0 ? (
              <div className="card">
                <div className="shared-deps-grid">
                  {sharedData.shared.map(dep => (
                    <a
                      key={dep.name}
                      href={`/package/${encodeURIComponent(dep.name)}`}
                      className="chip"
                    >
                      📦 {dep.name}
                      {dep.version && (
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          v{dep.version}
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            ) : sharedData ? (
              <div className="card">
                <div className="empty-state" style={{ padding: 'var(--space-6)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>🔍</div>
                  <div className="empty-state-title" style={{ fontSize: 'var(--text-base)' }}>No shared dependencies</div>
                  <div className="empty-state-desc">
                    <strong>{pkgA}</strong> and <strong>{pkgB}</strong> don't share any direct dependencies
                  </div>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      )}

      {/* Empty state */}
      {!loading && !pathData && !sharedData && !pkgA && !pkgB && (
        <div className="empty-state">
          <div className="empty-state-icon">🔀</div>
          <div className="empty-state-title">Select two packages to compare</div>
          <div className="empty-state-desc">
            Use the search fields above to pick two packages. You'll see the shortest
            dependency path between them and any shared dependencies.
          </div>
        </div>
      )}
    </div>
  );
}
