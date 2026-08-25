import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import SearchBar from '../components/SearchBar';
import PackageCard from '../components/PackageCard';
import SkeletonLoader from '../components/SkeletonLoader';

export default function HomePage() {
  const [packages, setPackages] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.listPackages().catch(() => ({ packages: [] })),
      api.getOverview().catch(() => null),
    ]).then(([pkgData, statsData]) => {
      setPackages(pkgData.packages || []);
      setStats(statsData);
      setLoading(false);
    });
  }, []);

  return (
    <div className="page">
      {/* Hero Section */}
      <section className="home-hero">
        <h1 className="home-hero-title">
          Explore Package Dependencies.<br />
          Discover What Breaks.
        </h1>
        <p className="home-hero-desc">
          DepGraph lets you visualize npm dependency trees, explore the blast radius
          of vulnerabilities, and uncover hidden supply-chain risks — all powered by
          a graph database.
        </p>
        <div className="home-search-wrapper">
          <SearchBar large />
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="home-stats stagger-children">
          <div className="card stat-card">
            <div className="stat-value">{stats.packageCount?.toLocaleString() || 0}</div>
            <div className="stat-label">📦 Packages</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value">{stats.versionCount?.toLocaleString() || 0}</div>
            <div className="stat-label">📋 Versions</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value">{stats.maintainerCount?.toLocaleString() || 0}</div>
            <div className="stat-label">👤 Maintainers</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value">{stats.vulnerabilityCount?.toLocaleString() || 0}</div>
            <div className="stat-label">🛡️ Vulnerabilities</div>
          </div>
        </section>
      )}

      {/* Package Grid */}
      <section className="home-section" id="packages-section">
        <h2 className="home-section-title">
          🔥 Most Connected Packages
        </h2>
        {loading ? (
          <SkeletonLoader type="card" count={6} />
        ) : packages.length > 0 ? (
          <div className="home-packages-grid stagger-children">
            {packages.map((pkg) => (
              <PackageCard key={pkg.name} pkg={pkg} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <div className="empty-state-title">No packages found</div>
            <div className="empty-state-desc">
              Run the seed script to load packages into the database:
              <code style={{ display: 'block', marginTop: '0.5rem', padding: '0.5rem', background: 'var(--color-bg-subtle)', borderRadius: '6px' }}>
                cd backend && npm run seed
              </code>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
