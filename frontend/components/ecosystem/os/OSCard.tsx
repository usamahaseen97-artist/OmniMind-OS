"use client";

import type { ReactNode } from "react";
import { cn } from "../../../lib/utils";

type OSCardProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  span?: 1 | 2;
};

export function OSCard({ title, subtitle, action, children, className, span = 1 }: OSCardProps) {
  return (
    <section
      className={cn(
        "flex min-h-0 flex-col rounded-xl border border-white/[0.06] bg-[#0c1018]/90 p-3 backdrop-blur-sm",
        span === 2 && "md:col-span-2",
        className,
      )}
    >
      <header className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-300/90">{title}</h3>
          {subtitle ? <p className="truncate text-[10px] text-zinc-500">{subtitle}</p> : null}
        </div>
        {action}
      </header>
      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
    </section>
  );
}
