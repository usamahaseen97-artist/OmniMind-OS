"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  fetchBufferHealing,
  fetchCurrentMood,
  type BufferHealing,
  type MoodTheme,
} from "../../lib/bigdata-api";
import { cn } from "../../lib/utils";

type MoodContextValue = {
  mood: MoodTheme | null;
  bufferHealing: BufferHealing | null;
  refresh: () => void;
};

const MoodContext = createContext<MoodContextValue>({
  mood: null,
  bufferHealing: null,
  refresh: () => {},
});

export function useEntertainmentMood() {
  return useContext(MoodContext);
}

export function EntertainmentMoodProvider({
  userId = "anonymous",
  children,
}: {
  userId?: string;
  children: ReactNode;
}) {
  const [mood, setMood] = useState<MoodTheme | null>(null);
  const [bufferHealing, setBufferHealing] = useState<BufferHealing | null>(null);

  const refresh = useCallback(() => {
    const ctrl = new AbortController();
    void Promise.all([
      fetchCurrentMood(userId, ctrl.signal),
      fetchBufferHealing(userId, ctrl.signal),
    ]).then(([m, b]) => {
      setMood(m);
      setBufferHealing(b);
    });
    return () => ctrl.abort();
  }, [userId]);

  useEffect(() => {
    refresh();
    const id = window.setInterval(refresh, 12_000);
    return () => window.clearInterval(id);
  }, [refresh]);

  const cssVars = mood?.css_variables ?? {};

  const wrapperClass = useMemo(
    () => cn("entertainment-mood-root min-h-0 min-w-0 w-full max-w-full flex-1", mood?.tailwind_class),
    [mood?.tailwind_class],
  );

  return (
    <MoodContext.Provider value={{ mood, bufferHealing, refresh }}>
      <div className={wrapperClass} style={cssVars as React.CSSProperties}>
        {children}
      </div>
    </MoodContext.Provider>
  );
}
