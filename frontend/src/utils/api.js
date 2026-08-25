const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || data.message || `HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error("Can't reach the server — is the backend running?");
    }
    throw err;
  }
}

export const api = {
  // Health
  health: () => request('/health'),

  // Packages
  searchPackages: (search) => request(`/packages?search=${encodeURIComponent(search)}`),
  listPackages: () => request('/packages'),
  getPackage: (name) => request(`/packages/${encodeURIComponent(name)}`),
  getPackageGraph: (name) => request(`/packages/${encodeURIComponent(name)}/graph`),

  // Blast Radius
  getBlastRadius: (packageName) => request(`/blast-radius/${encodeURIComponent(packageName)}`),

  // Paths
  getShortestPath: (from, to) =>
    request(`/path?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),

  // Shared Dependencies
  getSharedDeps: (a, b) =>
    request(`/shared-deps?a=${encodeURIComponent(a)}&b=${encodeURIComponent(b)}`),

  // Cycles
  getCycles: () => request('/cycles'),

  // Stats
  getOverview: () => request('/stats/overview'),
  getMostDepended: () => request('/stats/most-depended'),
  getMaintainerRisk: () => request('/stats/maintainer-risk'),
};
