"use client";

import { cn } from "../../lib/utils";

interface DeckMicroLoaderProps {
  label: string;
  className?: string;
  pulse?: boolean;
}

export function DeckMicroLoader({ label, className, pulse = true }: DeckMicroLoaderProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-emerald-500/25 bg-[#0B0C10]/90 px-2.5 py-2",
        className,
      )}
    >
      <span
        className={cn(
          "h-2 w-2 shrink-0 rounded-full bg-[#00FF87] shadow-[0_0_8px_#00FF87]",
          pulse && "animate-pulse",
        )}
      />
      <span className="text-[10px] font-medium text-zinc-400">{label}</span>
      <span className="ml-auto flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1 w-1 animate-bounce rounded-full bg-emerald-500/80"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </span>
    </div>
  );
}
