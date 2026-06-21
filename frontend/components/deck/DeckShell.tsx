"use client";

import type { ReactNode } from "react";
import { deckPanelScroll } from "../../lib/deck-interactive";
import { cn } from "../../lib/utils";

interface DeckShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function DeckShell({ title, subtitle, children, className }: DeckShellProps) {
  return (
    <div className={cn(deckPanelScroll, className)}>
      <div className="shrink-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/80">
          {title}
        </p>
        {subtitle ? (
          <p className="mt-0.5 text-[10px] text-zinc-600">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}
