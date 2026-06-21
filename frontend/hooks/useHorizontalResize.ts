"use client";

import { useCallback, useRef, useState } from "react";

export function useHorizontalResize(initialWidth: number, min = 200, max = 560) {
  const [width, setWidth] = useState(initialWidth);
  const [isDragging, setIsDragging] = useState(false);
  const draggingRef = useRef(false);
  const startX = useRef(0);
  const startW = useRef(initialWidth);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      draggingRef.current = true;
      setIsDragging(true);
      startX.current = e.clientX;
      startW.current = width;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [width],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingRef.current) return;
      const delta = startX.current - e.clientX;
      setWidth(Math.min(max, Math.max(min, startW.current + delta)));
    },
    [max, min],
  );

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    draggingRef.current = false;
    setIsDragging(false);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }, []);

  return { width, setWidth, isDragging, onPointerDown, onPointerMove, onPointerUp };
}
