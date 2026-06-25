"use client";

import { cn } from "../../lib/utils";

type DSTabsProps = {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
};

export function DSTabs({ tabs, active, onChange, className }: DSTabsProps) {
  return (
    <div className={cn("flex gap-1", className)} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-[10px] font-medium transition",
            active === tab.id
              ? "bg-[color:var(--omni-ds-accent-primary)]/15 text-[color:var(--omni-ds-text-accent)]"
              : "text-[color:var(--omni-ds-text-muted)] hover:bg-white/[0.04] hover:text-[color:var(--omni-ds-text-primary)]",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
