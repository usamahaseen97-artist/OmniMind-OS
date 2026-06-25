"use client";

import { Cloud, FileImage, Film, Folder, Music, Search, Shapes } from "lucide-react";
import { cn } from "../../lib/utils";
import { useVisionaryAI } from "../../lib/visionary/ai-context";

const ASSET_CATEGORIES = [
  { id: "all", label: "All", icon: Folder },
  { id: "images", label: "Images", icon: FileImage },
  { id: "video", label: "Video", icon: Film },
  { id: "audio", label: "Audio", icon: Music },
  { id: "vectors", label: "Vectors", icon: Shapes },
  { id: "cloud", label: "Cloud", icon: Cloud },
] as const;

const SAMPLE_ASSETS = [
  { id: "a1", name: "Brand_Hero_4K.png", type: "image", size: "12.4 MB", cloud: true },
  { id: "a2", name: "Product_Spin.mp4", type: "video", size: "84 MB", cloud: true },
  { id: "a3", name: "Ambient_Loop.wav", type: "audio", size: "8.1 MB", cloud: false },
  { id: "a4", name: "Logo_Master.svg", type: "vector", size: "240 KB", cloud: true },
  { id: "a5", name: "Social_Template_9x16.fig", type: "template", size: "1.2 MB", cloud: true },
  { id: "a6", name: "Cinematic_LUT.cube", type: "lut", size: "512 KB", cloud: false },
];

export function VisionaryAssetLibrary({ compact = false }: { compact?: boolean }) {
  const { assets: aiAssets } = useVisionaryAI();
  const displayAssets =
    aiAssets.length > 0
      ? aiAssets.map((a) => ({
          id: a.id,
          name: a.name,
          type: a.kind,
          size: `${(a.sizeBytes / 1_000_000).toFixed(1)} MB`,
          cloud: a.cloudSynced,
        }))
      : SAMPLE_ASSETS;
  return (
    <div className={cn("visionary-asset-library flex flex-col", compact ? "h-full" : "h-full min-h-0")}>
      <div className="shrink-0 border-b border-white/[0.06] px-2 py-2">
        <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">Asset Library</p>
        {!compact ? (
          <div className="relative mt-2">
            <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              type="search"
              placeholder="Filter assets…"
              className="h-7 w-full rounded border border-white/[0.08] bg-black/30 pl-7 pr-2 text-[10px] text-slate-300 outline-none focus:border-cyan-500/30"
            />
          </div>
        ) : null}
      </div>

      <div className="flex shrink-0 gap-1 overflow-x-auto px-2 py-1">
        {ASSET_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={cn(
              "flex shrink-0 items-center gap-1 rounded px-2 py-1 text-[8px]",
              cat.id === "all" ? "bg-cyan-500/15 text-cyan-200" : "text-slate-500 hover:bg-white/[0.04]",
            )}
          >
            <cat.icon size={10} />
            {cat.label}
          </button>
        ))}
      </div>

      <ul className="min-h-0 flex-1 overflow-y-auto p-2">
        {displayAssets.map((asset) => (
          <li key={asset.id}>
            <button
              type="button"
              className="mb-1 flex w-full items-start gap-2 rounded border border-white/[0.04] bg-white/[0.02] p-2 text-left transition-colors hover:border-cyan-500/20 hover:bg-cyan-500/5"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-gradient-to-br from-slate-700 to-slate-900 text-[8px] uppercase text-slate-400">
                {asset.type.slice(0, 3)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] text-slate-200">{asset.name}</p>
                <p className="text-[8px] text-slate-600">
                  {asset.size}
                  {asset.cloud ? " · Cloud" : " · Local"}
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
