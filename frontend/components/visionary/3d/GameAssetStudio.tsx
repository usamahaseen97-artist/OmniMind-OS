"use client";

import { GAME_ASSET_CATEGORIES } from "../../../lib/visionary/studio3d/constants";
import { useVisionaryStudio3D } from "../../../lib/visionary/studio3d-context";

export function GameAssetStudio() {
  const { gameAssets, addGameAsset } = useVisionaryStudio3D();

  return (
    <div className="flex h-full flex-col p-4">
      <p className="mb-3 text-[10px] font-semibold uppercase text-cyan-400">Game Asset Lab</p>
      <div className="mb-4 grid grid-cols-5 gap-1">
        {GAME_ASSET_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => addGameAsset(c.id, c.label)}
            className="rounded border border-white/[0.06] px-1 py-2 text-[7px] text-slate-500 hover:text-cyan-200"
          >
            {c.label}
          </button>
        ))}
      </div>
      <ul className="space-y-1">
        {gameAssets.map((a) => (
          <li key={a.id} className="rounded bg-white/[0.03] px-2 py-1 text-[9px] text-slate-400">
            {a.name} · {a.category} · {a.polyCount || "—"} tris
          </li>
        ))}
      </ul>
    </div>
  );
}
