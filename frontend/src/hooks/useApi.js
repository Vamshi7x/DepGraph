import { useState, useEffect, useCallback } from 'react';

export function useApi(apiFn, args = [], options = {}) {
  const { immediate = true } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...callArgs) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFn(...(callArgs.length ? callArgs : args));
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiFn, JSON.stringify(args)]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { data, loading, error, execute, setData };
}
