"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function GenerationHistory() {
  const { generationHistory, retryJob } = useOmniMusicStudio();

  return (
    <div>
      <p className="mb-1 text-[9px] uppercase text-slate-600">History</p>
      <ul className="max-h-24 space-y-0.5 overflow-y-auto text-[8px] text-slate-500">
        {generationHistory.map((j) => (
          <li key={j.id} className="flex justify-between">
            <span>{j.workflow} · {new Date(j.createdAt).toLocaleTimeString()}</span>
            <span className="capitalize">{j.status}</span>
            {j.status === "failed" ? <button type="button" onClick={() => retryJob(j.id)} className="text-violet-400">Retry</button> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
