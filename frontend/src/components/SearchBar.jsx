import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import { api } from '../utils/api';

export default function SearchBar({ large = false, onSelect, placeholder }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 250);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    api.searchPackages(debouncedQuery)
      .then(data => {
        setResults(data.packages || []);
        setIsOpen(true);
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(pkg) {
    setQuery('');
    setIsOpen(false);
    if (onSelect) {
      onSelect(pkg);
    } else {
      navigate(`/package/${encodeURIComponent(pkg.name)}`);
    }
  }

  return (
    <div className="input-group" ref={wrapperRef}>
      <span className="input-icon">🔍</span>
      <input
        type="text"
        className={`input input-with-icon ${large ? 'input-lg' : ''}`}
        placeholder={placeholder || 'Search packages... (e.g. express, react, lodash)'}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setIsOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && query.trim()) {
            e.preventDefault();
            const matched = results.find(r => r.name.toLowerCase() === query.trim().toLowerCase()) || results[0];
            handleSelect(matched || { name: query.trim() });
          }
        }}
        id="search-packages"
      />
      {loading && (
        <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)' }}>
          <div className="spinner"></div>
        </div>
      )}
      {isOpen && results.length > 0 && (
        <div className="search-dropdown">
          {results.map((pkg) => (
            <div
              key={pkg.name}
              className="search-dropdown-item"
              onClick={() => handleSelect(pkg)}
            >
              <div className="search-dropdown-item-name">
                📦 {pkg.name}
                {pkg.latest_version && (
                  <span style={{ color: 'var(--color-text-muted)', fontWeight: 'normal', marginLeft: '8px', fontSize: '0.75rem' }}>
                    v{pkg.latest_version}
                  </span>
                )}
              </div>
              {pkg.description && (
                <div className="search-dropdown-item-desc">{pkg.description}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
