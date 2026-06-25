"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronRight,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SovereignToolDef } from "../../lib/sovereign-tool-registry";
import { useOmniMindEcosystem } from "../../lib/omnimind-ecosystem-context";
import { ecosystemToolByPath } from "../../lib/omnimind-ecosystem-registry";
import { probeBackendOnline } from "../../lib/backend-health";
import { ThemeHub } from "../theme/ThemeHub";
import { LiveEngineIndicator } from "../layout/LiveEngineIndicator";
import { cn } from "../../lib/utils";
import { OS_TOKENS } from "./tokens";

type OmniMindOSHeaderProps = {
  tool?: SovereignToolDef;
};

/** Universal OS header — logo, tool, breadcrumbs, search, palette, theme, status. */
export function OmniMindOSHeader({ tool }: OmniMindOSHeaderProps) {
  const pathname = usePathname() ?? "/";
  const {
    breadcrumbs,
    setCommandPaletteOpen,
    setQuickSearchOpen,
    notifications,
    executeNavigateBack,
    routeDispatching,
  } = useOmniMindEcosystem();
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const ecoTool = ecosystemToolByPath(pathname);
  const crumbs = tool ? ["OmniMind", tool.name, ...breadcrumbs.slice(2)] : breadcrumbs;

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      const ok = await probeBackendOnline();
      if (!cancelled) setApiOnline(ok);
    };
    void tick();
    const id = window.setInterval(() => void tick(), 8000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return (
    <header
      className="flex h-11 shrink-0 items-center gap-2 border-b px-3"
      style={{ borderColor: OS_TOKENS.border.subtle, background: OS_TOKENS.bg.header }}
    >
      <button
        type="button"
        onClick={() => void executeNavigateBack("Back to Neural Chatbot")}
        className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 py-1 transition hover:bg-white/[0.05]"
        title="Back to Neural Chatbot"
      >
        {routeDispatching ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
        ) : (
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
        )}
        <span className="hidden text-[10px] font-bold tracking-wide text-zinc-200 sm:inline">OmniMind</span>
      </button>

      <ChevronRight className="hidden h-3 w-3 text-zinc-600 sm:block" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-semibold text-zinc-100">
          {tool?.name ?? ecoTool.label}
        </p>
        <p className="truncate text-[9px] text-zinc-500">
          {crumbs.join(" › ")}
        </p>
      </div>

      <button
        type="button"
        onClick={() => setQuickSearchOpen(true)}
        className={cn(
          "hidden items-center gap-2 rounded-lg border px-2.5 py-1 text-[10px] text-zinc-500 transition hover:text-zinc-300 md:flex",
          OS_TOKENS.glass.chip,
        )}
      >
        <Search className="h-3.5 w-3.5" />
        <span>Search…</span>
        <kbd className="rounded border border-white/10 px-1 font-mono text-[8px]">⌘K</kbd>
      </button>

      <button
        type="button"
        onClick={() => setCommandPaletteOpen(true)}
        className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-[9px] font-medium text-zinc-400 transition hover:text-cyan-300"
        title="Command palette (Ctrl+K)"
      >
        ⌘K
      </button>

      <button
        type="button"
        className="relative rounded-lg p-1.5 text-zinc-500 transition hover:bg-white/[0.04] hover:text-zinc-300"
        title="Notifications"
      >
        <Bell className="h-4 w-4" />
        {notifications.length ? (
          <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-cyan-400" />
        ) : null}
      </button>

      <ThemeHub />

      <LiveEngineIndicator
        active={apiOnline !== false}
        title={apiOnline === false ? "API reconnecting" : "Backend online"}
      />

      {!tool ? (
        <Link href="/" className="text-[9px] text-cyan-400/80 hover:text-cyan-300">
          Home
        </Link>
      ) : null}
    </header>
  );
}
