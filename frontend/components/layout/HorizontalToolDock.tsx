"use client";

import { SIDEBAR_TOOLS, type OmniRouteId } from "../../lib/omni-tools";
import { cn } from "../../lib/utils";

const ACCENT_HOVER: Record<string, string> = {
  cyan: "hover:border-cyan-500/40 hover:text-cyan-300 hover:bg-cyan-500/10",
  violet: "hover:border-violet-500/40 hover:text-violet-300 hover:bg-violet-500/10",
  fuchsia: "hover:border-fuchsia-500/40 hover:text-fuchsia-300 hover:bg-fuchsia-500/10",
  emerald: "hover:border-[#10B981]/40 hover:text-[#00FF87] hover:bg-[#10B981]/10",
  green: "hover:border-[#10B981]/40 hover:text-[#00FF87] hover:bg-[#10B981]/10",
  amber: "hover:border-amber-500/40 hover:text-amber-300 hover:bg-amber-500/10",
};

const ACCENT_ACTIVE: Record<string, string> = {
  cyan: "border-cyan-500/50 bg-cyan-500/15 text-cyan-300",
  violet: "border-violet-500/50 bg-violet-500/15 text-violet-300",
  fuchsia: "border-fuchsia-500/50 bg-fuchsia-500/15 text-fuchsia-300",
  emerald: "border-[#10B981]/50 bg-[#10B981]/15 text-[#00FF87]",
  green: "border-[#10B981]/50 bg-[#10B981]/15 text-[#00FF87]",
  amber: "border-amber-500/50 bg-amber-500/15 text-amber-300",
};

interface HorizontalToolDockProps {
  activeRoute: OmniRouteId | string;
  onSelect: (id: OmniRouteId) => void;
  className?: string;
}

/**
 * Floating horizontal sub-nav for secondary OmniMind tools (above chat workspace).
 */
export function HorizontalToolDock({
  activeRoute,
  onSelect,
  className,
}: HorizontalToolDockProps) {
  return (
    <div
      className={cn(
        "shrink-0 px-3 py-2.5 md:px-4",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-6xl flex-wrap items-center gap-2 rounded-2xl",
          "border border-gray-800/60 bg-[#15171E]/90 px-3 py-2 backdrop-blur-xl",
          "shadow-[0_8px_32px_rgba(0,0,0,0.35)]",
        )}
      >
        <button
          type="button"
          onClick={() => onSelect("dashboard")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-all duration-200",
            "active:scale-[0.98]",
            activeRoute === "dashboard"
              ? "border-[#10B981]/50 bg-[#10B981]/15 text-[#00FF87] shadow-[0_0_16px_rgba(0,255,135,0.15)]"
              : "border-gray-700/80 bg-transparent text-zinc-400 hover:border-[#10B981]/40 hover:text-[#10B981]",
          )}
        >
          Chat
        </button>
        <span className="hidden h-4 w-px bg-gray-700/80 sm:block" aria-hidden />
        {SIDEBAR_TOOLS.filter(
          (t) => !["about", "system-modules", "neural-history"].includes(t.id),
        ).map((tool) => {
          const Icon = tool.icon;
          const active = activeRoute === tool.id;
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => onSelect(tool.id)}
              title={tool.description}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-all duration-200",
                "active:scale-[0.98]",
                active
                  ? ACCENT_ACTIVE[tool.accent] ?? ACCENT_ACTIVE.green
                  : cn(
                      "border-gray-700/80 bg-transparent text-zinc-400",
                      ACCENT_HOVER[tool.accent] ?? ACCENT_HOVER.green,
                    ),
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0 opacity-90" />
              <span className="max-w-[8rem] truncate">{tool.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
