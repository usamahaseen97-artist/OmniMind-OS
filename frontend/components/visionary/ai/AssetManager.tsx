"use client";

import { useState } from "react";
import { cn } from "../../../lib/utils";
import { useVisionaryAI } from "../../../lib/visionary/ai-context";

const ASSET_TABS = [
  "all",
  "image",
  "video",
  "audio",
  "3d",
  "logo",
  "template",
  "stock",
  "brand",
] as const;

/** AI-managed asset library — generated, brand, stock, templates. */
export function AssetManager({ full = false }: { full?: boolean }) {
  const { assets } = useVisionaryAI();
  const [tab, setTab] = useState<(typeof ASSET_TABS)[number]>("all");

  const filtered =
    tab === "all" ? assets : assets.filter((a) => a.kind === tab || (tab === "brand" && a.source === "brand-kit"));

  return (
    <div className={cn("flex h-full flex-col", !full && "max-h-64")}>
      <div className="shrink-0 border-b border-white/[0.06] px-3 py-2">
        <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-500">Asset Library</p>
      </div>
      <div className="flex shrink-0 gap-1 overflow-x-auto px-2 py-1">
        {ASSET_TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "shrink-0 rounded px-2 py-0.5 text-[8px] capitalize",
              tab === t ? "bg-cyan-500/15 text-cyan-200" : "text-slate-500",
            )}
          >
            {t}
          </button>
        ))}
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto p-2 grid grid-cols-2 gap-2 content-start">
        {filtered.map((asset) => (
          <li key={asset.id}>
            <button
              type="button"
              className="w-full rounded border border-white/[0.06] bg-white/[0.02] p-2 text-left hover:border-cyan-500/25"
            >
              <div className="mb-2 flex h-16 items-center justify-center rounded bg-gradient-to-br from-slate-800 to-slate-900 text-[9px] uppercase text-slate-500">
                {asset.kind}
              </div>
              <p className="truncate text-[10px] text-slate-200">{asset.name}</p>
              <p className="text-[8px] text-slate-600">
                {(asset.sizeBytes / 1_000_000).toFixed(1)} MB · {asset.source}
                {asset.cloudSynced ? " · ☁" : ""}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
