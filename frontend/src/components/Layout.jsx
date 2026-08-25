import Navbar from './Navbar';
import ErrorBanner from './ErrorBanner';
import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export default function Layout({ children }) {
  const [dbError, setDbError] = useState(false);

  useEffect(() => {
    api.health()
      .then(() => setDbError(false))
      .catch(() => setDbError(true));
  }, []);

  return (
    <>
      <Navbar />
      {dbError && (
        <div style={{ padding: '1rem 2rem' }}>
          <ErrorBanner
            onRetry={() => {
              api.health()
                .then(() => setDbError(false))
                .catch(() => setDbError(true));
            }}
          />
        </div>
      )}
      <main className="layout">
        {children}
      </main>
    </>
  );
}
