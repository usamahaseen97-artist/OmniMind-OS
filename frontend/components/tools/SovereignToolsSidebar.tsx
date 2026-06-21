"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Sparkles } from "lucide-react";
import { SOVEREIGN_TOOLS } from "../../lib/sovereign-tool-registry";
import { getToolAccent, TOOL_SIDEBAR_GROUPS } from "../../lib/tool-ui-styles";
import { cn } from "../../lib/utils";

export function SovereignToolsSidebar() {
  const pathname = usePathname();
  const toolBySlug = Object.fromEntries(SOVEREIGN_TOOLS.map((t) => [t.slug, t]));

  return (
    <aside className="flex h-full w-[min(252px,82vw)] shrink-0 flex-col border-r border-emerald-500/15 bg-[#0a0c10]/98 backdrop-blur-xl">
      <div className="shrink-0 border-b border-emerald-500/10 px-3 py-3">
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-2.5 py-2 transition hover:border-emerald-400/35 hover:bg-emerald-500/10"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/30 to-emerald-600/10">
            <LayoutDashboard className="h-4 w-4 text-[#00FF87]" />
          </div>
          <div className="min-w-0">
            <span className="block text-xs font-bold tracking-wide text-[#00FF87]">OmniMind V11</span>
            <span className="block text-[9px] text-zinc-500">General Chatbot</span>
          </div>
        </Link>
        <p className="mt-2 flex items-center gap-1 px-1 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600">
          <Sparkles className="h-3 w-3 text-emerald-500/60" />
          16 Sovereign Tools
        </p>
      </div>

      <nav
        className="history-scroll-hover min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-2 py-2"
        aria-label="Sovereign tool navigation"
      >
        {TOOL_SIDEBAR_GROUPS.map((group) => (
          <div key={group.label} className="mb-3">
            <p className="mb-1 px-2 text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-600">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.slugs.map((slug) => {
                const tool = toolBySlug[slug];
                if (!tool) return null;
                const Icon = tool.icon;
                const active = pathname === tool.href;
                const accent = getToolAccent(slug);
                return (
                  <li key={tool.slug}>
                    <Link
                      href={tool.href}
                      prefetch
                      title={tool.description}
                      className={cn(
                        "group flex items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-all duration-200",
                        active
                          ? cn(
                              "bg-gradient-to-r from-emerald-500/15 to-emerald-500/[0.04] font-semibold text-[#00FF87]",
                              "shadow-[inset_0_0_0_1px_rgba(16,185,129,0.35)]",
                            )
                          : "text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/[0.06] bg-black/30 transition",
                          active ? accent.ring : "group-hover:border-emerald-500/20",
                        )}
                      >
                        <Icon className={cn("h-3.5 w-3.5", active ? accent.text : "text-zinc-500 group-hover:text-emerald-400")} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[11px] leading-tight">{tool.name}</span>
                        <span className="block truncate text-[9px] font-normal text-zinc-600 group-hover:text-zinc-500">
                          {tool.tagline}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
