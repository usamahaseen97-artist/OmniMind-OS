"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";
import { ds } from "./styles";

type DSCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padding?: "none" | "sm" | "md";
};

export function DSCard({ children, className, padding = "md", ...props }: DSCardProps) {
  return (
    <div
      className={cn(
        ds.surface.card,
        padding === "sm" && "p-2.5",
        padding === "md" && "p-3.5",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DSGlassCard({ children, className, ...props }: DSCardProps) {
  return (
    <div className={cn(ds.surface.panel, "rounded-xl p-3.5", className)} {...props}>
      {children}
    </div>
  );
}

type DSMetricCardProps = {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: string;
  className?: string;
};

export function DSMetricCard({ label, value, icon, trend, className }: DSMetricCardProps) {
  return (
    <DSCard className={className} padding="md">
      <div className="flex items-center gap-2 text-[color:var(--omni-ds-text-accent)]">
        {icon}
        <span className={ds.text.label}>{label}</span>
      </div>
      <p className="mt-2 text-lg font-semibold text-[color:var(--omni-ds-text-primary)]">{value}</p>
      {trend ? <p className="mt-1 text-[9px] text-[color:var(--omni-ds-text-muted)]">{trend}</p> : null}
    </DSCard>
  );
}
