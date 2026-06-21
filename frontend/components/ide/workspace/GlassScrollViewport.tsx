"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { IconScrollMore } from "../../ui/IconScrollActions";
import { cn } from "../../../lib/utils";

interface GlassScrollViewportProps {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  /** Floating up/down — only for tall panels with hidden content */
  showControls?: boolean;
}

/**
 * Scroll container — default is native scrollbar only.
 * Pass showControls for long feeds (analytics, logs) where content is clipped.
 */
export function GlassScrollViewport({
  children,
  className,
  innerClassName,
  showControls = false,
}: GlassScrollViewportProps) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);

  const measure = useCallback(() => {
    const el = innerRef.current;
    if (!el) return;
    setCanScroll(el.scrollHeight - el.clientHeight > 48);
  }, []);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    el.addEventListener("scroll", measure, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", measure);
    };
  }, [measure, children]);

  const scrollBy = useCallback((delta: number) => {
    innerRef.current?.scrollBy({ top: delta, behavior: "smooth" });
  }, []);

  return (
    <div className={cn("omni-glass-scroll relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden", className)}>
      <div
        ref={innerRef}
        className={cn(
          "omni-glass-scroll-inner omni-pro-scroll ide-pane-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden scroll-smooth",
          innerClassName,
        )}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {children}
      </div>
      {showControls && canScroll ? (
        <div className="pointer-events-none absolute right-2 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-2">
          <IconScrollMore
            direction="up"
            ariaLabel="Scroll up"
            className="pointer-events-auto omni-state-ring"
            onClick={() => scrollBy(-200)}
          />
          <IconScrollMore
            direction="down"
            ariaLabel="Scroll down"
            className="pointer-events-auto omni-state-ring"
            onClick={() => scrollBy(200)}
          />
        </div>
      ) : null}
    </div>
  );
}
