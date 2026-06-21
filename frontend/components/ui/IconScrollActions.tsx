"use client";

import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import { cn } from "../../lib/utils";

const iconBtn =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-500/35 bg-[#15171E]/90 text-[#10B981] shadow-md backdrop-blur-md transition hover:border-emerald-400/55 hover:text-[#00FF87] active:scale-95";

/** Icon-only scroll / expand control — no visible label text. */
export function IconScrollMore({
  onClick,
  direction = "right",
  className,
  ariaLabel = "Show more",
}: {
  onClick: () => void;
  direction?: "right" | "down" | "up";
  className?: string;
  ariaLabel?: string;
}) {
  const Icon =
    direction === "down" ? ChevronDown : direction === "up" ? ChevronUp : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(iconBtn, className)}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
