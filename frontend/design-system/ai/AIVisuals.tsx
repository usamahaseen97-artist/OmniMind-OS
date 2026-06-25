"use client";

import { cn } from "../../lib/utils";

/** AI thinking / reasoning pulse indicator */
export function DSThinkingIndicator({ label = "Thinking", className }: { label?: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-[color:var(--omni-ds-accent-primary)]"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </span>
      <span className="text-[10px] text-[color:var(--omni-ds-text-accent)]">{label}</span>
    </div>
  );
}

export function DSStreamingDots({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex gap-0.5", className)} aria-label="Streaming">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block h-1 w-1 animate-bounce rounded-full bg-[color:var(--omni-ds-accent-primary)]"
          style={{ animationDelay: `${i * 120}ms` }}
        />
      ))}
    </span>
  );
}

export function DSTypingIndicator({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1 rounded-lg bg-white/[0.03] px-2 py-1", className)}>
      <DSStreamingDots />
    </div>
  );
}

type DSReasoningStage = { id: string; label: string; status: "pending" | "active" | "done" | "error" };

export function DSReasoningTimeline({ stages, className }: { stages: DSReasoningStage[]; className?: string }) {
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {stages.map((s) => (
        <span
          key={s.id}
          className={cn(
            "rounded px-1.5 py-0.5 text-[9px]",
            s.status === "active" && "bg-[color:var(--omni-ds-accent-primary)]/20 text-[color:var(--omni-ds-text-accent)]",
            s.status === "done" && "bg-[color:var(--omni-ds-status-success-bg)] text-[color:var(--omni-ds-status-success)]",
            s.status === "pending" && "bg-white/[0.04] text-[color:var(--omni-ds-text-muted)]",
            s.status === "error" && "bg-[color:var(--omni-ds-status-error-bg)] text-[color:var(--omni-ds-status-error)]",
          )}
        >
          {s.label}
        </span>
      ))}
    </div>
  );
}

export function DSExecutionProgress({ label, progress, className }: { label: string; progress: number; className?: string }) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex justify-between text-[9px] text-[color:var(--omni-ds-text-muted)]">
        <span>{label}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full bg-[color:var(--omni-ds-accent-primary)] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function DSMemoryUsage({ used, total, className }: { used: number; total: number; className?: string }) {
  const pct = total > 0 ? (used / total) * 100 : 0;
  return (
    <div className={cn("text-[9px] text-[color:var(--omni-ds-text-muted)]", className)}>
      <span>Memory {used}/{total}</span>
      <div className="mt-1 h-1 rounded-full bg-white/[0.06]">
        <div className="h-full rounded-full bg-violet-400/60" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
