"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

/** Shallow-stable selector hook — reduces re-renders when only a slice changes. */
export function useSelector<TState, TSelected>(
  subscribe: (onStoreChange: () => void) => () => void,
  getSnapshot: () => TState,
  selector: (state: TState) => TSelected,
  isEqual: (a: TSelected, b: TSelected) => boolean = Object.is,
): TSelected {
  const selectorRef = useRef(selector);
  selectorRef.current = selector;

  const sliceRef = useRef<TSelected | undefined>(undefined);

  const getSelected = useCallback(() => {
    const next = selectorRef.current(getSnapshot());
    if (sliceRef.current !== undefined && isEqual(sliceRef.current, next)) {
      return sliceRef.current;
    }
    sliceRef.current = next;
    return next;
  }, [getSnapshot, isEqual]);

  return useSyncExternalStore(subscribe, getSelected, getSelected);
}
