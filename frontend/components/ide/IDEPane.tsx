"use client";

import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface IDEPaneProps {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
}

export function IDEPane({
  title,
  subtitle,
  badge,
  children,
  className,
  headerClassName,
  bodyClassName,
}: IDEPaneProps) {
  return (
    <div
      className={cn("flex h-full min-h-0 flex-col overflow-hidden", className)}
      style={{ background: "var(--omni-panel-alt)" }}
    >
      <header
        className={cn(
          "flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2",
          headerClassName,
        )}
        style={{ borderColor: "var(--omni-border)", background: "var(--omni-panel)" }}
      >
        <div className="min-w-0">
          <h2 className="truncate text-[10px] font-bold uppercase tracking-[0.14em] omni-accent-text">{title}</h2>
          {subtitle ? (
            <p className="truncate text-[10px]" style={{ color: "var(--omni-text-muted)" }}>{subtitle}</p>
          ) : null}
        </div>
        {badge}
      </header>
      <div className={cn("ide-pane-scroll omni-pro-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden", bodyClassName)}>
        {children}
      </div>
    </div>
  );
}
