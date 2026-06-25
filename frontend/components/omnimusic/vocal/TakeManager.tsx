"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function TakeManager() {
  const { vocalTakes, starTake, compTake, deleteTake, analyzeTake } = useOmniMusicStudio();

  return (
    <div className="mb-3">
      <p className="mb-1 text-[9px] uppercase text-slate-600">Take Manager</p>
      <ul className="space-y-1">
        {vocalTakes.map((t) => (
          <li key={t.id} className="flex items-center justify-between rounded border border-white/[0.04] px-2 py-1 text-[8px] text-slate-500">
            <span className={t.comped ? "text-cyan-200" : ""}>{t.name} · {t.durationBeats} beats {t.starred ? "★" : ""}</span>
            <span className="flex gap-2">
              <button type="button" onClick={() => starTake(t.id)}>Star</button>
              <button type="button" onClick={() => compTake(t.id)}>Comp</button>
              <button type="button" onClick={() => analyzeTake(t.id)}>Analyze</button>
              <button type="button" onClick={() => deleteTake(t.id)}>Del</button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
