"use client";

import { APP_VIEWS, type AppViewId } from "../../lib/app-views";
import { cn } from "../../lib/utils";

interface AppViewSidebarProps {
  activeView: AppViewId;
  onSelect: (id: AppViewId) => void;
  className?: string;
}

/**
 * Macro-engine rail — General Chatbot, OmniMusic, OmniStream, OmniTV only.
 */
export function AppViewSidebar({ activeView, onSelect, className }: AppViewSidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full w-[88px] shrink-0 flex-col border-r border-gray-800/60 bg-[#0B0C10] py-4 lg:w-[92px]",
        className,
      )}
    >
      <div className="mb-4 flex justify-center">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#10B981] to-[#059669] shadow-[0_0_20px_rgba(16,185,129,0.35)]" />
      </div>
      <nav className="flex flex-1 flex-col items-center gap-2 px-2">
        {APP_VIEWS.map((view) => {
          const Icon = view.icon;
          const active = activeView === view.id;
          return (
            <button
              key={view.id}
              type="button"
              title={`${view.label} — ${view.tagline}`}
              onClick={() => onSelect(view.id)}
              className={cn(
                "group flex w-full flex-col items-center gap-1.5 rounded-2xl px-2 py-3 transition-all duration-200",
                active
                  ? "bg-[#15171E] text-[#00FF87] shadow-[0_0_24px_rgba(16,185,129,0.15)] ring-1 ring-[#10B981]/40"
                  : "text-zinc-500 hover:bg-[#15171E]/60 hover:text-[#10B981]",
              )}
            >
              <Icon
                className={cn(
                  "h-6 w-6 transition-transform duration-200 group-hover:scale-105",
                  active && "text-[#00FF87]",
                )}
              />
              <span className="max-w-full text-center text-[9px] font-semibold leading-tight lg:text-[10px]">
                {view.label.split(" ").map((w, i) => (
                  <span key={i} className="block">
                    {w}
                  </span>
                ))}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
