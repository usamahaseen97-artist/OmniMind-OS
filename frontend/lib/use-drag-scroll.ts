"use client";

import { useCallback, useRef, type PointerEvent as ReactPointerEvent } from "react";

type Axis = "x" | "y" | "both";

/**
 * Pointer-drag scrolling — smooth horizontal chip rows & vertical panes.
 */
export function useDragScroll<T extends HTMLElement>(axis: Axis = "both") {
  const ref = useRef<T>(null);
  const drag = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });

  const onPointerDown = useCallback((e: ReactPointerEvent<T>) => {
    const el = ref.current;
    if (!el || e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest("button, a, input, textarea, select, [data-no-drag-scroll]")) return;

    drag.current = {
      active: true,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      scrollLeft: el.scrollLeft,
      scrollTop: el.scrollTop,
    };
    el.setPointerCapture(e.pointerId);
    el.style.cursor = axis === "x" ? "grabbing" : axis === "y" ? "grabbing" : "grabbing";
    el.classList.add("omni-drag-scrolling");
  }, [axis]);

  const endDrag = useCallback((e: ReactPointerEvent<T>) => {
    const el = ref.current;
    if (!el || !drag.current.active) return;
    if (e.pointerId !== drag.current.pointerId) return;
    drag.current.active = false;
    try {
      el.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    el.style.cursor = "";
    el.classList.remove("omni-drag-scrolling");
  }, []);

  const onPointerMove = useCallback((e: ReactPointerEvent<T>) => {
    const el = ref.current;
    if (!el || !drag.current.active || e.pointerId !== drag.current.pointerId) return;
    const dx = e.clientX - drag.current.startX;
    const dy = e.clientY - drag.current.startY;
    if (axis === "x" || axis === "both") {
      el.scrollLeft = drag.current.scrollLeft - dx;
    }
    if (axis === "y" || axis === "both") {
      el.scrollTop = drag.current.scrollTop - dy;
    }
  }, [axis]);

  return {
    ref,
    dragHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
  };
}
