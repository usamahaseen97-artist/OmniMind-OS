"use client";

import { HEADER_MACRO_VIEWS, type AppViewId } from "../../lib/app-views";
import { cn } from "../../lib/utils";

interface MacroEngineTabsProps {
  activeView: AppViewId;
  onSelect: (id: AppViewId) => void;
  className?: string;
}

export function MacroEngineTabs({ activeView, onSelect, className }: MacroEngineTabsProps) {
  const safeSelect = (id: AppViewId) => {
    try {
      onSelect(id);
    } catch (error) {
      console.error("[OmniMind] macro tab navigation failed:", error);
    }
  };

  return (
    <nav
      className={cn(
        "flex min-w-0 flex-row flex-wrap items-center justify-end gap-0.5",
        className,
      )}
      aria-label="Macro engines"
    >
      {HEADER_MACRO_VIEWS.map((view) => {
        const Icon = view.icon;
        const active =
          activeView === view.id ||
          (view.id === "omnimovies" && activeView === "omnistream");
        return (
          <button
            key={view.id}
            type="button"
            onClick={() => safeSelect(view.id)}
            title={view.tagline}
            className={cn(
              "inline-flex h-6 shrink-0 items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold backdrop-blur-md transition-all duration-150",
              active
                ? "border-emerald-400/50 bg-emerald-500/20 text-[#00FF87] ring-1 ring-emerald-500/30"
                : "border-gray-700/50 bg-[#1E293B]/40 text-zinc-400 hover:border-emerald-500/35 hover:text-[#00FF87]",
            )}
          >
            <Icon className="h-3 w-3 shrink-0" />
            <span className="max-w-[4.5rem] truncate sm:max-w-none">{view.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
