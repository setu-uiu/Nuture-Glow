import { useState, useEffect } from 'react';

/**
 * Delays updating a value until after `delay` ms of inactivity.
 * Use for search inputs, resize handlers, etc.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
