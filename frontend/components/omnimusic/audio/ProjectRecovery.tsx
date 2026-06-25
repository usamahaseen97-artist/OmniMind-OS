"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function ProjectRecovery() {
  const { recoverySnapshots, restoreSnapshot } = useOmniMusicStudio();

  if (recoverySnapshots.length === 0) return null;

  return (
    <div className="border-b border-amber-500/20 bg-amber-500/5 p-2">
      <p className="mb-1 text-[9px] uppercase text-amber-400/90">Recovery</p>
      <ul className="max-h-20 space-y-0.5 overflow-y-auto">
        {recoverySnapshots.slice(0, 5).map((s) => (
          <li key={s.id} className="flex items-center justify-between text-[8px] text-slate-500">
            <span>{s.label} · {new Date(s.savedAt).toLocaleTimeString()}</span>
            <button type="button" onClick={() => restoreSnapshot(s.id)} className="text-pink-400">Restore</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
