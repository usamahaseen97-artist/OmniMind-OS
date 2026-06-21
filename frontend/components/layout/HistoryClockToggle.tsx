"use client";

import { Clock } from "lucide-react";
import type { RefObject } from "react";
import { cn } from "../../lib/utils";

interface HistoryClockToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  toggleRef: RefObject<HTMLButtonElement | null>;
  className?: string;
}

export function HistoryClockToggle({
  isOpen,
  onToggle,
  toggleRef,
  className,
}: HistoryClockToggleProps) {
  return (
    <button
      ref={toggleRef}
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-label={isOpen ? "Close chat history" : "Open chat history"}
      title="Chat history"
      className={cn(
        "fixed left-14 top-12 z-50 flex h-10 w-10 items-center justify-center rounded-xl",
        "border border-emerald-500/30 bg-[#0B0C10]/75 text-[#10B981] backdrop-blur-lg",
        "shadow-[0_0_12px_rgba(16,185,129,0.15)] transition-all duration-200",
        "hover:border-emerald-400/50 hover:bg-[#15171E]/90 hover:text-[#00FF87]",
        "hover:shadow-[0_0_20px_rgba(16,185,129,0.35)]",
        isOpen && "border-emerald-400/55 text-[#00FF87] ring-1 ring-emerald-500/30",
        className,
      )}
    >
      <Clock className="h-5 w-5" strokeWidth={2} />
      <span className="sr-only">Chat history</span>
    </button>
  );
}
