"use client";

import {
  Box,
  Brain,
  ChartLine,
  Crown,
  Database,
  Diamond,
  Eye,
  Gamepad2,
  Globe,
  Lock,
  Microscope,
  Shield,
  Sparkles,
  Terminal,
  Workflow,
  Zap,
} from "lucide-react";
import type { NavItem, NavSection } from "../lib/navigation";
import { INTEGRATION_HUBS, MAIN_NAV, POWER_SUITE } from "../lib/navigation";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "command-console": Terminal,
  "project-console": Database,
  "v11-sovereign": Sparkles,
  subscription: Diamond,
  "power-domains": Box,
  "universal-compiler": Zap,
  "game-engine": Gamepad2,
  "web-architect": Globe,
  "logic-translator": Brain,
  "trade-oracle": ChartLine,
  "bio-digital-scan": Microscope,
  "omni-vision": Eye,
  "sovereign-vault": Shield,
  "core-ai": Sparkles,
  "apps-dev": Globe,
  "medical-ai": Microscope,
  "trading-hub": ChartLine,
  "media-workflow": Workflow,
  "workflow-auto": Workflow,
  "analyze-tools": Database,
};

interface SidebarProps {
  activeId: string;
  onSelect: (item: NavItem) => void;
}

function NavGroup({
  section,
  activeId,
  onSelect,
}: {
  section: NavSection;
  activeId: string;
  onSelect: (item: NavItem) => void;
}) {
  return (
    <div className="space-y-1">
      {section.title && (
        <p className="px-3 pt-4 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
          {section.title}
        </p>
      )}
      {section.items.map((item) => {
        const Icon = ICONS[item.id] ?? Sparkles;
        const active = activeId === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              try {
                onSelect(item);
              } catch (error) {
                console.error("[OmniMind] sidebar navigation failed:", error);
              }
            }}
            className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all ${
              active
                ? "bg-amber-500/10 text-amber-100 ring-1 ring-amber-500/30"
                : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
            }`}
          >
            <Icon
              className={`h-4 w-4 shrink-0 ${active ? "text-amber-400" : "text-zinc-500 group-hover:text-zinc-300"}`}
            />
            <span className="flex-1 truncate font-medium">{item.label}</span>
            {item.badge && (
              <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] font-bold text-zinc-400">
                {item.badge}
              </span>
            )}
            {item.locked && <Lock className="h-3 w-3 text-zinc-600" />}
          </button>
        );
      })}
    </div>
  );
}

export function Sidebar({ activeId, onSelect }: SidebarProps) {
  return (
    <aside className="relative flex h-full w-[260px] shrink-0 flex-col border-r border-zinc-800/80 bg-[#0c0c10]">
      <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-amber-500/50 via-amber-500/20 to-transparent" />

      <header className="border-b border-zinc-800/60 px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg shadow-blue-900/40">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide text-white">OMNIMIND V11</h1>
            <p className="text-[10px] text-zinc-500">Sovereign OS</p>
          </div>
        </div>
      </header>

      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <NavGroup section={MAIN_NAV} activeId={activeId} onSelect={onSelect} />
        <NavGroup section={POWER_SUITE} activeId={activeId} onSelect={onSelect} />
        <NavGroup section={INTEGRATION_HUBS} activeId={activeId} onSelect={onSelect} />
      </nav>

      <footer className="border-t border-zinc-800/60 p-3">
        <div className="rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-950/80 to-blue-900/20 p-3">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-amber-400" />
            <div>
              <p className="text-xs font-semibold text-white">Founder Tier</p>
              <p className="text-[10px] text-blue-400">USAMA HASEEN ACCESS</p>
            </div>
          </div>
        </div>
      </footer>
    </aside>
  );
}
