"use client";

import { useEffect, useMemo, useState } from "react";
import { FileCode2, Folder, Search, X } from "lucide-react";
import { useIDE } from "../ide/IDEProvider";
import { useOmniMindEcosystem } from "../../lib/omnimind-ecosystem-context";
import { ECOSYSTEM_TOOLS } from "../../lib/omnimind-ecosystem-registry";

export function OmniMindQuickSearch() {
  const { quickSearchOpen, setQuickSearchOpen, projectTabs, navigateToTool } = useOmniMindEcosystem();
  const { projectFiles, openFile } = useIDE();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!quickSearchOpen) setQuery("");
  }, [quickSearchOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const files = projectFiles
      .filter((f) => !f.isFolder && f.path.toLowerCase().includes(q))
      .slice(0, 12)
      .map((f) => ({ kind: "file" as const, label: f.path, file: f }));
    const projects = projectTabs
      .filter((p) => p.name.toLowerCase().includes(q))
      .map((p) => ({ kind: "project" as const, label: p.name, id: p.id }));
    const tools = ECOSYSTEM_TOOLS.filter((t) => t.label.toLowerCase().includes(q)).map((t) => ({
      kind: "tool" as const,
      label: t.label,
      id: t.id,
    }));
    return [...files, ...projects, ...tools].slice(0, 16);
  }, [projectFiles, projectTabs, query]);

  if (!quickSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/60 pt-[10vh] backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-xl border border-white/[0.1] bg-[#12141c] shadow-2xl">
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-2.5">
          <Search className="h-4 w-4 text-cyan-400/80" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files, projects, tools, agents…"
            className="min-w-0 flex-1 bg-transparent text-[12px] text-zinc-200 outline-none"
            onKeyDown={(e) => e.key === "Escape" && setQuickSearchOpen(false)}
          />
          <button type="button" onClick={() => setQuickSearchOpen(false)}>
            <X className="h-4 w-4 text-zinc-500" />
          </button>
        </div>
        <div className="max-h-[45vh] overflow-y-auto py-1">
          {!query ? (
            <p className="px-3 py-4 text-[10px] text-zinc-600">Type to search across OmniMind drive…</p>
          ) : results.length ? (
            results.map((r, i) => (
              <button
                key={`${r.kind}-${i}`}
                type="button"
                onClick={() => {
                  if (r.kind === "file") openFile(r.file);
                  if (r.kind === "tool") navigateToTool(r.id);
                  setQuickSearchOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-white/[0.04]"
              >
                {r.kind === "file" ? (
                  <FileCode2 className="h-3.5 w-3.5 text-amber-400/80" />
                ) : r.kind === "project" ? (
                  <Folder className="h-3.5 w-3.5 text-cyan-400/80" />
                ) : (
                  <Search className="h-3.5 w-3.5 text-indigo-400/80" />
                )}
                <span className="truncate font-mono text-[10px] text-zinc-300">{r.label}</span>
                <span className="ml-auto text-[8px] uppercase text-zinc-600">{r.kind}</span>
              </button>
            ))
          ) : (
            <p className="px-3 py-4 text-[10px] text-zinc-600">No matches</p>
          )}
        </div>
      </div>
    </div>
  );
}
