"use client";

import { LayoutDashboard } from "lucide-react";
import { OMNI_TOOLS, SIDEBAR_TOOLS, type OmniRouteId } from "../../lib/omni-tools";
import { cn } from "../../lib/utils";
import { ChatHistoryPanel } from "./ChatHistoryPanel";

const ACCENT: Record<string, string> = {
  cyan: "ring-cyan-400/40 bg-cyan-500/15 text-cyan-300",
  violet: "ring-violet-400/40 bg-violet-500/15 text-violet-300",
  fuchsia: "ring-fuchsia-400/40 bg-fuchsia-500/15 text-fuchsia-300",
  emerald: "ring-emerald-400/40 bg-emerald-500/15 text-emerald-300",
  green: "ring-neon-green/40 bg-neon-green/10 text-neon-green",
  amber: "ring-amber-400/40 bg-amber-500/15 text-amber-300",
};

interface OmniSidebarProps {
  activeRoute: OmniRouteId | string;
  onSelect: (id: OmniRouteId) => void;
  userId: string;
  activeSessionId?: string;
  onSelectSession: (sessionId: string) => void;
  onNewChat?: () => void;
}

export function OmniSidebar({
  activeRoute,
  onSelect,
  userId,
  activeSessionId,
  onSelectSession,
  onNewChat,
}: OmniSidebarProps) {
  const dashboard = OMNI_TOOLS.find((t) => t.id === "dashboard")!;

  return (
    <aside className="flex h-full w-full flex-col border-r border-violet-500/10 bg-[#04050a]/95 backdrop-blur-xl lg:w-[300px]">
      <header className="shrink-0 border-b border-cyan-500/10 px-3 py-3">
        <p className="text-[10px] font-bold tracking-[0.25em] text-cyan-400/80">OMNIMIND OS</p>
        <p className="text-[10px] text-zinc-600">All tools · one cockpit</p>
      </header>

      <nav className="shrink-0 border-b border-white/[0.06] p-2">
        <button
          type="button"
          onClick={() => onSelect("dashboard")}
          className={cn(
            "flex w-full items-center gap-2 rounded-xl px-2 py-2.5 text-left transition",
            activeRoute === "dashboard"
              ? `ring-1 ${ACCENT.green}`
              : "hover:bg-white/[0.04]",
          )}
        >
          <LayoutDashboard
            className={cn(
              "h-4 w-4",
              activeRoute === "dashboard" ? "text-neon-green" : "text-zinc-500",
            )}
          />
          <span>
            <span className="block text-xs font-semibold text-zinc-100">General Chatbot</span>
            <span className="block text-[10px] text-zinc-600">{dashboard.tagline}</span>
          </span>
        </button>
      </nav>

      <nav className="scrollbar-thin min-h-0 flex-1 space-y-0.5 overflow-y-auto p-2">
        <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400/70">
          Tools
        </p>
        {SIDEBAR_TOOLS.map((tool) => {
          const Icon = tool.icon;
          const active = activeRoute === tool.id;
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => onSelect(tool.id)}
              className={cn(
                "flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left transition",
                active ? `ring-1 ${ACCENT[tool.accent]}` : "hover:bg-white/[0.03]",
              )}
            >
              <Icon
                className={cn(
                  "mt-0.5 h-4 w-4 shrink-0",
                  active ? "opacity-100" : "text-zinc-600",
                )}
              />
              <span>
                <span className="block text-[11px] font-medium leading-tight text-zinc-200">
                  {tool.name}
                </span>
                <span className="block text-[9px] text-zinc-600">{tool.tagline}</span>
              </span>
            </button>
          );
        })}
      </nav>

      <ChatHistoryPanel
        userId={userId}
        activeSessionId={activeSessionId}
        onSelectSession={onSelectSession}
        onNewChat={onNewChat}
      />
    </aside>
  );
}
