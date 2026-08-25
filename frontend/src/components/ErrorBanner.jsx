export default function ErrorBanner({ onRetry }) {
  return (
    <div className="error-banner" id="error-banner">
      <div className="error-banner-icon">⚠️</div>
      <div className="error-banner-text">
        <div className="error-banner-title">Can't reach the database right now</div>
        <div className="error-banner-desc">
          Make sure Neo4j/CognoDB is running and the backend server is started.
        </div>
      </div>
      {onRetry && (
        <button className="btn btn-secondary btn-sm" onClick={onRetry} id="retry-connection">
          🔄 Retry
        </button>
      )}
    </div>
  );
}
