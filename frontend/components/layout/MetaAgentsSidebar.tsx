"use client";

import { META_AGENTS } from "../../lib/agents";
import { SUPER_TOOLS } from "../../lib/super-tools";
import { isSuperTool } from "../../lib/superapp";
import { cn } from "../../lib/utils";
import { ConversationList, type Conversation } from "../chat/ConversationList";

interface MetaAgentsSidebarProps {
  activeAgent: string;
  onAgentSelect: (id: string) => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onConversationSelect: (id: string) => void;
  onNewChat: () => void;
}

const ACCENT_RING: Record<string, string> = {
  cyan: "ring-cyan-400/40 bg-cyan-500/15 text-cyan-300",
  fuchsia: "ring-fuchsia-400/40 bg-fuchsia-500/15 text-fuchsia-300",
  violet: "ring-violet-400/40 bg-violet-500/15 text-violet-300",
  emerald: "ring-emerald-400/40 bg-emerald-500/15 text-emerald-300",
};

export function MetaAgentsSidebar({
  activeAgent,
  onAgentSelect,
  conversations,
  activeConversationId,
  onConversationSelect,
  onNewChat,
}: MetaAgentsSidebarProps) {
  return (
    <aside className="flex h-full w-full flex-col border-r border-violet-500/10 bg-[#04050a]/95 backdrop-blur-xl lg:w-[300px]">
      <header className="cockpit-hero border-b border-cyan-500/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/30 to-violet-600/30 text-lg text-white shadow-[0_0_24px_rgba(99,102,241,0.35)] ring-1 ring-white/10">
            ◈
          </span>
          <div>
            <h1 className="text-sm font-bold tracking-[0.2em] text-white">OMNIMIND OS</h1>
            <p className="text-[10px] text-cyan-400/70">AI Super-App Cockpit</p>
          </div>
        </div>
      </header>

      <nav className="border-b border-violet-500/10 p-2">
        <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-violet-400/80">
          Super-App Tools
        </p>
        <div className="space-y-1">
          {SUPER_TOOLS.map((tool) => {
            const Icon = tool.icon;
            const active = activeAgent === tool.id;
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => onAgentSelect(tool.id)}
                className={cn(
                  "group flex w-full items-start gap-2 rounded-xl px-2 py-2.5 text-left transition-all duration-300",
                  active
                    ? `ring-1 ${ACCENT_RING[tool.accent]} shadow-[0_0_20px_rgba(99,102,241,0.12)]`
                    : "hover:bg-white/[0.04]",
                )}
              >
                <Icon
                  className={cn(
                    "mt-0.5 h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110",
                    active && tool.accent === "cyan" && "text-cyan-400",
                    active && tool.accent === "fuchsia" && "text-fuchsia-400",
                    active && tool.accent === "violet" && "text-violet-400",
                    active && tool.accent === "emerald" && "text-emerald-400",
                    !active && "text-zinc-500",
                  )}
                />
                <span>
                  <span className="block text-xs font-semibold text-zinc-100">{tool.name}</span>
                  <span className="block text-[10px] text-zinc-600">{tool.tagline}</span>
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {!isSuperTool(activeAgent) && (
        <nav className="border-b border-white/[0.04] p-2">
          <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
            Meta-Agents
          </p>
          <div className="max-h-[200px] space-y-0.5 overflow-y-auto scrollbar-thin">
            {META_AGENTS.map((agent) => {
              const Icon = agent.icon;
              return (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => onAgentSelect(agent.id)}
                  className={cn(
                    "flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left transition",
                    activeAgent === agent.id
                      ? "bg-neon-green/10 ring-1 ring-neon-green/30"
                      : "hover:bg-white/[0.03]",
                  )}
                >
                  <Icon
                    className={cn(
                      "mt-0.5 h-4 w-4 shrink-0",
                      activeAgent === agent.id ? "text-neon-green" : "text-zinc-500",
                    )}
                  />
                  <span>
                    <span className="block text-xs font-medium text-zinc-200">{agent.name}</span>
                    <span className="block text-[10px] text-zinc-600">{agent.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {!isSuperTool(activeAgent) && (
        <ConversationList
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={onConversationSelect}
          onNew={onNewChat}
        />
      )}
    </aside>
  );
}
