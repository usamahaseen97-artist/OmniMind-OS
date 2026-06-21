"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  Brain,
  FolderTree,
  LayoutGrid,
  Menu,
  PanelLeftClose,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { SOVEREIGN_TOOLS, type SovereignToolSlug } from "../../lib/sovereign-tool-registry";
import { TOOL_SIDEBAR_GROUPS } from "../../lib/tool-ui-styles";
import { cn } from "../../lib/utils";

interface ActivityBarProps {
  activeSlug?: string;
  filesOpen?: boolean;
  onFilesToggle?: () => void;
}

function ActivityIcon({
  active,
  title,
  onClick,
  children,
}: {
  active?: boolean;
  title: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-md transition-all duration-150",
        active
          ? "bg-[#00ffcc]/10 text-[#00ffcc] before:absolute before:left-0 before:top-1/2 before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-[#00ffcc]"
          : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300",
      )}
    >
      {children}
    </button>
  );
}

/** VS Code / Cursor-style activity bar — collapsed by default, overlay on expand */
export function ActivityBar({ activeSlug, filesOpen, onFilesToggle }: ActivityBarProps) {
  const pathname = usePathname();
  const [toolsOpen, setToolsOpen] = useState(false);
  const toolBySlug = Object.fromEntries(SOVEREIGN_TOOLS.map((t) => [t.slug, t]));
  const currentSlug = (activeSlug ?? pathname.replace("/", "")) as SovereignToolSlug;

  const closeOverlay = () => setToolsOpen(false);

  return (
    <>
      {toolsOpen ? (
        <button
          type="button"
          aria-label="Close tools overlay"
          className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px]"
          style={{ left: 48 }}
          onClick={closeOverlay}
        />
      ) : null}

      <aside
        className="relative z-50 flex h-full w-12 shrink-0 flex-col items-center border-r border-white/[0.06] bg-[#0a0b0e] py-1.5"
        aria-label="Activity bar"
      >
        <Link
          href="/"
          title="Back to General Chatbot"
          className="mb-1 flex h-10 w-10 items-center justify-center rounded-md text-zinc-400 transition hover:bg-white/[0.05] hover:text-[#00ffcc]"
        >
          <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={2} />
        </Link>

        <ActivityIcon
          title={toolsOpen ? "Collapse tools menu" : "Expand tools menu"}
          active={toolsOpen}
          onClick={() => setToolsOpen((o) => !o)}
        >
          {toolsOpen ? (
            <PanelLeftClose className="h-[18px] w-[18px]" />
          ) : (
            <Menu className="h-[18px] w-[18px]" />
          )}
        </ActivityIcon>

        <ActivityIcon title="Sovereign tools" onClick={() => setToolsOpen(true)}>
          <LayoutGrid className="h-[18px] w-[18px]" />
        </ActivityIcon>

        <div className="my-1 h-px w-6 bg-white/[0.06]" />

        <ActivityIcon title="Intelligence modules" onClick={() => setToolsOpen(true)}>
          <Brain className="h-[18px] w-[18px]" />
        </ActivityIcon>

        <div className="flex-1" />

        <ActivityIcon title="Project file tree" active={filesOpen} onClick={onFilesToggle}>
          <FolderTree className="h-[18px] w-[18px]" />
        </ActivityIcon>

        <Link
          href="/"
          title="Settings"
          className="mb-1 flex h-10 w-10 items-center justify-center rounded-md text-zinc-600 transition hover:bg-white/[0.04] hover:text-zinc-400"
        >
          <Settings className="h-[18px] w-[18px]" />
        </Link>
      </aside>

      <nav
        className={cn(
          "fixed left-12 top-0 z-50 flex h-full w-[min(248px,78vw)] flex-col border-r border-[#00ffcc]/10 bg-[#0c0d11]/98 shadow-[8px_0_40px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-transform duration-200 ease-out",
          toolsOpen ? "translate-x-0" : "-translate-x-[120%] pointer-events-none opacity-0",
        )}
        aria-hidden={!toolsOpen}
        aria-label="Tools overlay"
      >
        <div className="border-b border-white/[0.06] px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00ffcc]/80">
            Sovereign Tools
          </p>
          <p className="mt-0.5 text-[10px] text-zinc-600">Click a route to navigate</p>
        </div>
        <div className="ide-pane-scroll flex-1 overflow-y-auto px-2 py-2">
          {TOOL_SIDEBAR_GROUPS.map((group) => (
            <div key={group.label} className="mb-4">
              <p className="mb-1.5 px-2 text-[9px] font-bold uppercase tracking-wider text-zinc-600">
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
                        onClick={closeOverlay}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[11px] transition",
                          active
                            ? "bg-[#00ffcc]/10 font-semibold text-[#00ffcc]"
                            : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200",
                        )}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{tool.name}</span>
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
