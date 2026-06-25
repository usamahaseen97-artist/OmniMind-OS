"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOmniMindEcosystem } from "../../lib/omnimind-ecosystem-context";
import { OMNI_OS_COMMAND_ITEMS } from "../../lib/omnimind-os-command-items";
import { normalizeHomeRoute } from "../../lib/normalize-home-route";
import { omniCore } from "../../core/omnicore";
import type { EcosystemToolId } from "../../lib/omnimind-ecosystem-registry";

export function OmniMindCommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, setCommandPaletteOpen, dispatchEcosystemCommand, navigateToTool } = useOmniMindEcosystem();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!commandPaletteOpen) setQuery("");
  }, [commandPaletteOpen]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return OMNI_OS_COMMAND_ITEMS;

    const nl = q.startsWith("ask ") || q.startsWith(">") || q.startsWith("ai ");
    const coreItems = omniCore.commandPalette.setQuery(q).map((c) => ({
      id: c.id,
      label: c.label,
      group: c.category,
      keywords: c.keywords.join(" "),
      action: "command" as const,
      command: c.id,
    }));

    const filtered = OMNI_OS_COMMAND_ITEMS.filter(
      (i) =>
        i.label.toLowerCase().includes(q) ||
        i.group.toLowerCase().includes(q) ||
        i.keywords?.includes(q),
    );

    if (nl) {
      return [
        {
          id: "nl-ai",
          label: `Ask OmniMind: ${query.replace(/^(ask|>|ai)\s*/i, "")}`,
          group: "AI",
          keywords: "natural language ai",
          action: "command" as const,
          command: "cmd-ai-natural",
        },
        ...filtered,
        ...coreItems,
      ];
    }

    return [...filtered, ...coreItems.filter((c) => !filtered.some((f) => f.id === c.id))];
  }, [query]);

  if (!commandPaletteOpen) return null;

  const run = (item: (typeof OMNI_OS_COMMAND_ITEMS)[number] | { id: string; action: string; command?: string; toolId?: string; href?: string }) => {
    setCommandPaletteOpen(false);
    if (item.command === "cmd-ai-natural") {
      window.dispatchEvent(new CustomEvent("omnimind:fill-prompt", { detail: { text: query.replace(/^(ask|>|ai)\s*/i, "") } }));
      return;
    }
    if (item.action === "tool" && "toolId" in item && typeof item.toolId === "string") {
      navigateToTool(item.toolId as EcosystemToolId);
    } else if (item.action === "navigate" && "href" in item && item.href) {
      router.push(normalizeHomeRoute(item.href));
    } else if ("command" in item && item.command) {
      omniCore.commandPalette.execute(item.command);
      dispatchEcosystemCommand(item.command);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/60 pt-[12vh] backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-xl border border-white/[0.1] bg-[#12141c] shadow-2xl">
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-2">
          <Search className="h-4 w-4 text-zinc-500" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools, projects, commands, agents…"
            className="min-w-0 flex-1 bg-transparent text-[11px] text-zinc-200 outline-none placeholder:text-zinc-600"
            onKeyDown={(e) => {
              if (e.key === "Escape") setCommandPaletteOpen(false);
              if (e.key === "Enter" && items[0]) run(items[0]);
            }}
          />
          <button type="button" onClick={() => setCommandPaletteOpen(false)} className="text-zinc-500">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[50vh] overflow-y-auto py-1">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => run(item)}
              className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-indigo-500/10"
            >
              <span className="text-[11px] text-zinc-200">{item.label}</span>
              <span className="text-[8px] uppercase tracking-wider text-zinc-600">{item.group}</span>
            </button>
          ))}
        </div>
        <div className="border-t border-white/[0.04] px-3 py-1.5 font-mono text-[8px] text-zinc-600">
          Ctrl+Shift+P · Ctrl+K · ask … or &gt; for AI · Enter to run · Esc
        </div>
      </div>
    </div>
  );
}
