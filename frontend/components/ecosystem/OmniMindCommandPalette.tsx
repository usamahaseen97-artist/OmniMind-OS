"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { useOmniMindEcosystem } from "../../lib/omnimind-ecosystem-context";
import { COMMAND_PALETTE_ITEMS } from "../../lib/omnimind-ecosystem-registry";

export function OmniMindCommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen, dispatchEcosystemCommand, navigateToTool } = useOmniMindEcosystem();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!commandPaletteOpen) setQuery("");
  }, [commandPaletteOpen]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMMAND_PALETTE_ITEMS;
    return COMMAND_PALETTE_ITEMS.filter(
      (i) => i.label.toLowerCase().includes(q) || i.group.toLowerCase().includes(q) || i.keywords?.includes(q),
    );
  }, [query]);

  if (!commandPaletteOpen) return null;

  const run = (item: (typeof COMMAND_PALETTE_ITEMS)[number]) => {
    setCommandPaletteOpen(false);
    if (item.action === "tool" && item.toolId) navigateToTool(item.toolId);
    else if (item.command) dispatchEcosystemCommand(item.command);
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
            placeholder="Command palette — Build Website, Switch Tool…"
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
          Ctrl+Shift+P · Enter to run · Esc to close
        </div>
      </div>
    </div>
  );
}
