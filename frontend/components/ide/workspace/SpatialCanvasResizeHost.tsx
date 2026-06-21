"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "../../../lib/utils";

/** Observes container size — dispatches event so R3F canvases recalc aspect on panel drag */
export function SpatialCanvasResizeHost({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const notify = () => {
      window.dispatchEvent(
        new CustomEvent("omnimind:spatial-canvas-resize", {
          detail: { width: el.clientWidth, height: el.clientHeight },
        }),
      );
    };

    notify();
    const ro = new ResizeObserver(() => notify());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("relative h-full w-full min-h-0 min-w-0 overflow-hidden", className)}
      style={{ contain: "layout size style" }}
    >
      {children}
    </div>
  );
}
