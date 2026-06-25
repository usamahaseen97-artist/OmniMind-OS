"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function MusicAssetLibrary() {
  const { assets, toggleAssetFavorite } = useOmniMusicStudio();

  return (
    <div>
      <p className="mb-2 text-[9px] uppercase text-slate-600">Asset Library</p>
      {assets.length === 0 ? <p className="text-[8px] text-slate-600">Generated assets appear here</p> : null}
      <ul className="space-y-1">
        {assets.map((a) => (
          <li key={a.id} className="flex items-center justify-between rounded border border-white/[0.04] px-2 py-1 text-[8px] text-slate-500">
            <span>
              <span className="text-violet-200">{a.name}</span> · {a.kind} · {a.genre}
            </span>
            <button type="button" onClick={() => toggleAssetFavorite(a.id)} className={a.favorite ? "text-amber-400" : "text-slate-600"}>★</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
