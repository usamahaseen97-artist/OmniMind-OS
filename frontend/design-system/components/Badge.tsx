"use client";

import { cn } from "../../lib/utils";

type DSBadgeProps = {
  children: React.ReactNode;
  variant?: "default" | "accent" | "success" | "warning" | "error" | "live" | "tool" | "agent";
  className?: string;
};

const VARIANTS = {
  default: "bg-white/[0.06] text-[color:var(--omni-ds-text-muted)]",
  accent: "bg-[color:var(--omni-ds-accent-primary)]/15 text-[color:var(--omni-ds-text-accent)]",
  success: "bg-[color:var(--omni-ds-status-success-bg)] text-[color:var(--omni-ds-status-success)]",
  warning: "bg-[color:var(--omni-ds-status-warning-bg)] text-[color:var(--omni-ds-status-warning)]",
  error: "bg-[color:var(--omni-ds-status-error-bg)] text-[color:var(--omni-ds-status-error)]",
  live: "bg-[color:var(--omni-ds-status-success-bg)] text-[color:var(--omni-ds-status-live)]",
  tool: "bg-cyan-500/10 text-cyan-300",
  agent: "bg-violet-500/10 text-violet-300",
};

export function DSBadge({ children, variant = "default", className }: DSBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide",
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function DSToolBadge({ name, className }: { name: string; className?: string }) {
  return <DSBadge variant="tool" className={className}>{name}</DSBadge>;
}

export function DSAgentBadge({ name, className }: { name: string; className?: string }) {
  return <DSBadge variant="agent" className={className}>{name}</DSBadge>;
}

export function DSStatusIndicator({ status, label }: { status: "live" | "idle" | "error" | "warning"; label?: string }) {
  const colors = {
    live: "bg-[color:var(--omni-ds-status-live)]",
    idle: "bg-[color:var(--omni-ds-status-idle)]",
    error: "bg-[color:var(--omni-ds-status-error)]",
    warning: "bg-[color:var(--omni-ds-status-warning)]",
  };
  return (
    <span className="inline-flex items-center gap-1.5 text-[9px] text-[color:var(--omni-ds-text-muted)]">
      <span className={cn("h-1.5 w-1.5 rounded-full", colors[status], status === "live" && "animate-pulse")} />
      {label ?? status}
    </span>
  );
}
