"use client";

import { useEffect, useMemo } from "react";
import { useWorkspaceEngine } from "../../lib/workspace-engine-context";
import { cn } from "../../lib/utils";
import { OS_TOKENS } from "../os/tokens";

export function OmniMindWorkspaceQuickSwitcher() {
  const { quickSwitcherOpen, setQuickSwitcherOpen, mruTabIds, tabs, focusTab } =
    useWorkspaceEngine();

  const mruTabs = useMemo(
    () =>
      mruTabIds
        .map((id) => tabs.find((t) => t.id === id))
        .filter((t): t is NonNullable<typeof t> => Boolean(t)),
    [mruTabIds, tabs],
  );

  useEffect(() => {
    if (!quickSwitcherOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setQuickSwitcherOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [quickSwitcherOpen, setQuickSwitcherOpen]);

  if (!quickSwitcherOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[500] flex items-start justify-center bg-black/50 pt-[12vh] backdrop-blur-sm"
      onClick={() => setQuickSwitcherOpen(false)}
      role="dialog"
      aria-label="Workspace switcher"
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-xl border shadow-2xl"
        style={{ borderColor: OS_TOKENS.border.subtle, background: OS_TOKENS.bg.shell }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b px-4 py-2" style={{ borderColor: OS_TOKENS.border.subtle }}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400/80">
            Workspace Switcher
          </p>
          <p className="text-[9px] text-zinc-500">Ctrl+Tab · recent tools & workspaces</p>
        </div>
        <ul className="max-h-[50vh] overflow-y-auto p-2">
          {mruTabs.map((tab, i) => (
            <li key={tab.id}>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition hover:bg-white/[0.04]",
                  i === 0 && "bg-cyan-500/10 text-cyan-100",
                )}
                onClick={() => {
                  focusTab(tab.id);
                  setQuickSwitcherOpen(false);
                }}
              >
                <span className="font-mono text-[9px] text-zinc-600">{i + 1}</span>
                <span className="truncate font-medium">{tab.title}</span>
                <span className="ml-auto truncate text-[9px] text-zinc-600">{tab.href}</span>
              </button>
            </li>
          ))}
          {!mruTabs.length ? (
            <li className="px-3 py-4 text-center text-xs text-zinc-500">No open tabs</li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
