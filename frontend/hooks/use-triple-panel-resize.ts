"use client";

import { useCallback, useRef, useState } from "react";

export type TriplePanelBounds = {
  left: { default: number; min: number; max: number };
  right: { default: number; min: number; max: number };
  centerMin: number;
};

/** File explorer 15–35% · chat console 25–45% · center absorbs remainder */
export const TRIPLE_PANEL_BOUNDS: TriplePanelBounds = {
  left: { default: 20, min: 15, max: 35 },
  right: { default: 32, min: 25, max: 45 },
  centerMin: 25,
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function setResizeActive(active: boolean) {
  const root = document.documentElement;
  if (active) {
    root.classList.add("omni-panel-resize-active");
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  } else {
    root.classList.remove("omni-panel-resize-active");
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }
}

export function useTriplePanelResize(
  containerRef: React.RefObject<HTMLElement | null>,
  bounds: TriplePanelBounds = TRIPLE_PANEL_BOUNDS,
) {
  const [leftPct, setLeftPct] = useState(bounds.left.default);
  const [rightPct, setRightPct] = useState(bounds.right.default);
  const [activeEdge, setActiveEdge] = useState<"left" | "right" | null>(null);
  const dragRef = useRef<"left" | "right" | null>(null);
  const startX = useRef(0);
  const startLeft = useRef(bounds.left.default);
  const startRight = useRef(bounds.right.default);

  const centerPct = Math.max(0, 100 - leftPct - rightPct);
  const isDragging = activeEdge !== null;

  const notifyCanvasResize = useCallback(() => {
    window.dispatchEvent(
      new CustomEvent("omnimind:spatial-canvas-resize", { detail: { source: "panel-drag" } }),
    );
    window.dispatchEvent(
      new CustomEvent("omnimind:medical-canvas-resize", { detail: { source: "panel-drag" } }),
    );
  }, []);

  const beginDrag = useCallback(
    (edge: "left" | "right", e: React.PointerEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const captureEl = e.currentTarget;
      captureEl.setPointerCapture(e.pointerId);

      dragRef.current = edge;
      startX.current = e.clientX;
      startLeft.current = leftPct;
      startRight.current = rightPct;
      setActiveEdge(edge);
      setResizeActive(true);

      const onMove = (ev: PointerEvent) => {
        const el = containerRef.current;
        if (!el || !dragRef.current) return;
        const width = el.getBoundingClientRect().width || 1;
        const deltaPct = ((ev.clientX - startX.current) / width) * 100;

        if (dragRef.current === "left") {
          const maxLeft = Math.min(bounds.left.max, 100 - startRight.current - bounds.centerMin);
          let nextLeft = clamp(startLeft.current + deltaPct, bounds.left.min, maxLeft);
          const nextCenter = 100 - nextLeft - startRight.current;
          if (nextCenter < bounds.centerMin) {
            nextLeft = 100 - startRight.current - bounds.centerMin;
          }
          setLeftPct(nextLeft);
        } else {
          const maxRight = Math.min(bounds.right.max, 100 - startLeft.current - bounds.centerMin);
          let nextRight = clamp(startRight.current + deltaPct, bounds.right.min, maxRight);
          const nextCenter = 100 - startLeft.current - nextRight;
          if (nextCenter < bounds.centerMin) {
            nextRight = 100 - startLeft.current - bounds.centerMin;
          }
          setRightPct(nextRight);
        }
        notifyCanvasResize();
      };

      const onUp = (ev: PointerEvent) => {
        try {
          captureEl.releasePointerCapture(ev.pointerId);
        } catch {
          /* already released */
        }
        dragRef.current = null;
        setActiveEdge(null);
        setResizeActive(false);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
        notifyCanvasResize();
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    },
    [bounds, containerRef, leftPct, notifyCanvasResize, rightPct],
  );

  const onLeftGutterPointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => beginDrag("left", e),
    [beginDrag],
  );

  const onRightGutterPointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => beginDrag("right", e),
    [beginDrag],
  );

  return {
    leftPct,
    centerPct,
    rightPct,
    isDragging,
    activeEdge,
    onLeftGutterPointerDown,
    onRightGutterPointerDown,
  };
}
