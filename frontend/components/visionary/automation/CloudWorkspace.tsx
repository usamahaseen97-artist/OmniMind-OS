"use client";

import { useVisionaryAutomation } from "../../../lib/visionary/automation-context";

export function CloudWorkspace() {
  const { indexedAssets, searchQuery, setSearchQuery } = useVisionaryAutomation();

  return (
    <div className="flex h-full flex-col p-4">
      <p className="mb-3 text-[10px] font-semibold uppercase text-indigo-400">Cloud Workspace</p>
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search indexed assets…"
        className="mb-3 w-full rounded border border-white/10 bg-black/30 px-2 py-1 text-[10px] text-slate-300"
      />
      <ul className="space-y-1">
        {indexedAssets
          .filter((a) => !searchQuery || a.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((a) => (
            <li key={a.id} className="rounded bg-white/[0.03] px-2 py-1 text-[9px] text-slate-400">
              {a.name} · {a.kind} · {a.tags.join(", ")}
            </li>
          ))}
      </ul>
      <p className="mt-auto text-[8px] text-slate-600">Asset indexing · search engine — architecture stub</p>
    </div>
  );
}
