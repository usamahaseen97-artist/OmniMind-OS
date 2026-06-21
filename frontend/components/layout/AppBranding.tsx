"use client";

import { cn } from "../../lib/utils";

interface AppBrandingProps {
  className?: string;
  compact?: boolean;
  /** Minimal vertical footprint — Bismillah + OmniMind V11 preserved */
  ultraCompact?: boolean;
}

export function AppBranding({ className, compact, ultraCompact }: AppBrandingProps) {
  const tight = ultraCompact || compact;
  return (
    <header
      className={cn(
        "relative z-20 flex shrink-0 items-center justify-center border-b border-white/[0.05] bg-[#030308]/92 backdrop-blur-md",
        ultraCompact ? "px-1.5 py-0" : compact ? "px-2 py-0.5" : "px-4 py-2",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,136,0.04),transparent_72%)]"
        aria-hidden
      />
      <div className="relative flex max-w-2xl flex-col items-center leading-none">
        <p
          className={cn(
            "font-medium tracking-[0.16em] text-amber-200/45",
            ultraCompact ? "text-[6px]" : tight ? "text-[8px]" : "text-xs md:text-sm",
          )}
        >
          Bismillah
        </p>
        <h1
          className={cn(
            "font-bold tracking-[0.14em] text-neon-green",
            "drop-shadow-[0_0_16px_rgba(0,255,136,0.35)]",
            ultraCompact
              ? "text-xs sm:text-sm"
              : tight
                ? "text-sm sm:text-base"
                : "text-2xl sm:text-3xl md:text-4xl",
          )}
        >
          OmniMind V11
        </h1>
        {!ultraCompact ? (
          <p
            className={cn(
              "font-semibold uppercase tracking-[0.28em] text-neon-green/70",
              tight ? "mt-0 text-[6px]" : "mt-0.5 text-[9px] md:text-[10px]",
            )}
          >
            Universal Chatbot
          </p>
        ) : null}
      </div>
    </header>
  );
}
