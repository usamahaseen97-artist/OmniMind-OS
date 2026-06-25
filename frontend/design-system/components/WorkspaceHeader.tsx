"use client";

import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { ds } from "./styles";

type DSWorkspaceHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
};

export function DSWorkspaceHeader({ title, subtitle, actions, className }: DSWorkspaceHeaderProps) {
  return (
    <header
      className={cn(
        "flex shrink-0 items-center justify-between border-b px-4 py-3",
        "border-[color:var(--omni-ds-border-subtle)] bg-[color:var(--omni-ds-bg-header)]",
        className,
      )}
    >
      <div>
        <h1 className="text-sm font-bold text-[color:var(--omni-ds-text-primary)]">{title}</h1>
        {subtitle ? <p className="text-[9px] text-[color:var(--omni-ds-text-muted)]">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function DSSectionHeader({ title, action, className }: { title: string; action?: ReactNode; className?: string }) {
  return (
    <header
      className={cn(
        "flex shrink-0 items-center justify-between border-b px-3 py-2",
        "border-[color:var(--omni-ds-border-subtle)] bg-[color:var(--omni-ds-bg-panel-elevated)]",
        className,
      )}
    >
      <span className={ds.text.label}>{title}</span>
      {action}
    </header>
  );
}
