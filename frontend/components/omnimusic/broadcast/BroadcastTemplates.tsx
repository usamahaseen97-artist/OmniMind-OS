"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function BroadcastTemplates() {
  const { broadcastTemplates } = useOmniMusicStudio();

  return (
    <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
      <p className="mb-2 text-[9px] font-medium text-slate-300">Broadcast Templates</p>
      <ul className="space-y-1">
        {broadcastTemplates.map((t) => (
          <li key={t.id} className="rounded border border-white/[0.04] px-2 py-1 text-[8px]">
            <span className="text-slate-400">{t.name}</span>
            <span className="ml-2 capitalize text-slate-700">{t.category}</span>
            <p className="text-slate-600">{t.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
