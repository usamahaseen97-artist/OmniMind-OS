"use client";

import { cn } from "../../lib/utils";

interface LiveEngineIndicatorProps {
  /** When true, show subtle secure indicator (default: always show secure when backend reachable). */
  active?: boolean;
  className?: string;
  title?: string;
}

/** Ambient engine status — no offline instruction banners. */
export function LiveEngineIndicator({
  active = true,
  className,
  title = "Live Engine Secure — automatic cloud routing active",
}: LiveEngineIndicatorProps) {
  if (!active) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[9px] font-medium tracking-wide text-zinc-600",
        className,
      )}
      title={title}
      aria-label="Live Engine Secure"
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#00FF87] shadow-[0_0_6px_rgba(0,255,135,0.55)]"
        aria-hidden
      />
      <span className="hidden sm:inline text-[#10B981]/80">Live Engine Secure</span>
    </span>
  );
}
