"use client";

import { cn } from "../../lib/utils";

export function DSSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-white/[0.06]",
        className,
      )}
    />
  );
}

export function DSSpinner({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizes = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8" };
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-[color:var(--omni-ds-border-subtle)] border-t-[color:var(--omni-ds-accent-primary)]",
        sizes[size],
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

export function DSProgress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-1.5 overflow-hidden rounded-full bg-white/[0.06]", className)}>
      <div
        className="h-full rounded-full bg-[color:var(--omni-ds-accent-primary)] transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
