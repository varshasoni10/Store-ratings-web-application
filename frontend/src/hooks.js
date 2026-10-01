import { useCallback, useEffect, useState } from 'react';
import { api, toQuery } from './api';

// Fetches a list endpoint whenever filters or sort change (filters debounced).
export function useListQuery(path, filters, sort, pick) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [debounced, setDebounced] = useState(filters);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(filters), 300);
    return () => clearTimeout(t);
  }, [filters]);

  const reload = useCallback(() => {
    api
      .get(`${path}${toQuery({ ...debounced, ...sort })}`)
      .then((d) => {
        setData(pick(d));
        setError('');
      })
      .catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, debounced, sort]);

  useEffect(reload, [reload]);

  return { data, error, reload };
}
