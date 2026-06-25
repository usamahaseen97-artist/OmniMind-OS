"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function ReferenceTrackManager() {
  const { referenceTracks, applyReference, masteringChain } = useOmniMusicStudio();

  return (
    <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
      <p className="mb-2 text-[9px] font-medium text-slate-300">Reference Library</p>
      <ul className="space-y-1">
        {referenceTracks.map((ref) => (
          <li key={ref.id} className="flex items-center justify-between rounded border border-white/[0.04] px-2 py-1 text-[8px]">
            <span className="text-slate-400">{ref.name} · {ref.artist}</span>
            <span className="text-slate-600">{ref.targetLufs} LUFS</span>
            <button type="button" onClick={() => applyReference(ref)} className="text-amber-400">Match</button>
          </li>
        ))}
      </ul>
      {masteringChain.referenceTrackId ? <p className="mt-2 text-[7px] text-amber-500/70">Active ref: {masteringChain.referenceTrackId}</p> : null}
    </div>
  );
}
