import { useCallback, useRef } from "react";

/** Run at most once per animation frame (streaming tokens). */
export function useThrottledCallback<T extends (...args: never[]) => void>(fn: T): T {
  const fnRef = useRef(fn);
  const rafRef = useRef<number | null>(null);
  const pendingRef = useRef<Parameters<T> | null>(null);

  fnRef.current = fn;

  return useCallback(((...args: Parameters<T>) => {
    pendingRef.current = args;
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const a = pendingRef.current;
      pendingRef.current = null;
      if (a) fnRef.current(...a);
    });
  }) as T, []);
}
