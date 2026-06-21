"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  Brain,
  Clapperboard,
  FolderTree,
  Menu,
  PanelLeftClose,
  Sparkles,
  Wrench,
  Home,
  Radio,
} from "lucide-react";
import { useState } from "react";
import { SOVEREIGN_TOOLS, type SovereignToolSlug } from "../../lib/sovereign-tool-registry";
import { TOOL_SIDEBAR_GROUPS } from "../../lib/tool-ui-styles";
import { cn } from "../../lib/utils";

const GROUP_ICONS: Record<string, typeof Wrench> = {
  "Build & Deploy": Wrench,
  "Design & Space": Home,
  Intelligence: Brain,
  "Creative Studio": Clapperboard,
  "Omni Entertainment": Radio,
};

interface SovereignIconRailProps {
  activeSlug?: string;
  onFilesClick?: () => void;
  filesOpen?: boolean;
}

export function SovereignIconRail({ activeSlug, onFilesClick, filesOpen }: SovereignIconRailProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const toolBySlug = Object.fromEntries(SOVEREIGN_TOOLS.map((t) => [t.slug, t]));
  const currentSlug = (activeSlug ?? pathname.replace("/", "")) as SovereignToolSlug;

  return (
    <>
      {menuOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px] lg:left-12"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <aside className="relative z-50 flex h-full w-12 shrink-0 flex-col items-center border-r border-white/[0.06] bg-[#0a0b0e] py-2">
        <Link
          href="/"
          title="Back to General Chatbot"
          className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-white/[0.06] hover:text-[#00FF87]"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <button
          type="button"
          title={menuOpen ? "Collapse menu" : "Expand sovereign tools"}
          onClick={() => setMenuOpen((o) => !o)}
          className={cn(
            "mb-3 flex h-9 w-9 items-center justify-center rounded-lg transition",
            menuOpen
              ? "bg-emerald-500/15 text-[#00FF87]"
              : "text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-200",
          )}
        >
          {menuOpen ? <PanelLeftClose className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        <div className="flex flex-1 flex-col items-center gap-1.5">
          {TOOL_SIDEBAR_GROUPS.map((group) => {
            const GIcon = GROUP_ICONS[group.label] ?? Sparkles;
            const hasActive = group.slugs.includes(currentSlug);
            return (
              <button
                key={group.label}
                type="button"
                title={group.label}
                onClick={() => setMenuOpen(true)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg transition",
                  hasActive
                    ? "bg-emerald-500/12 text-[#00FF87] ring-1 ring-emerald-500/25"
                    : "text-zinc-600 hover:bg-white/[0.04] hover:text-zinc-400",
                )}
              >
                <GIcon className="h-4 w-4" />
              </button>
            );
          })}
        </div>

        <button
          type="button"
          title="Project files"
          onClick={onFilesClick}
          className={cn(
            "mb-2 flex h-9 w-9 items-center justify-center rounded-lg transition",
            filesOpen
              ? "bg-cyan-500/15 text-cyan-300"
              : "text-zinc-600 hover:bg-white/[0.04] hover:text-zinc-300",
          )}
        >
          <FolderTree className="h-4 w-4" />
        </button>

      </aside>

      <nav
        className={cn(
          "fixed left-12 top-0 z-50 flex h-full w-[min(240px,70vw)] flex-col border-r border-emerald-500/15 bg-[#0c0d11]/98 shadow-2xl backdrop-blur-xl transition-transform duration-200",
          menuOpen ? "translate-x-0" : "-translate-x-full pointer-events-none",
        )}
        aria-label="Sovereign tools expanded"
      >
        <div className="border-b border-white/[0.06] px-3 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500/70">
            Sovereign Tools
          </p>
        </div>
        <div className="history-scroll-hover flex-1 overflow-y-auto px-2 py-2">
          {TOOL_SIDEBAR_GROUPS.map((group) => (
            <div key={group.label} className="mb-3">
              <p className="mb-1 px-2 text-[9px] font-bold uppercase tracking-wider text-zinc-600">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.slugs.map((slug) => {
                  const tool = toolBySlug[slug];
                  if (!tool) return null;
                  const Icon = tool.icon;
                  const active = currentSlug === slug;
                  return (
                    <li key={slug}>
                      <Link
                        href={tool.href}
                        onClick={() => setMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] transition",
                          active
                            ? "bg-emerald-500/12 font-semibold text-[#00FF87]"
                            : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200",
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {tool.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>
    </>
  );
}
