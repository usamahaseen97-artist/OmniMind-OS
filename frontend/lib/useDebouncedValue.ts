import { useEffect, useState } from "react";

/** Debounce a value — keeps typing smooth while reducing parent re-renders. */
export function useDebouncedValue<T>(value: T, delayMs = 48): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}
