"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function GenerationQueue() {
  const { generationJobs, pauseJob, resumeJob, cancelJob, retryJob } = useOmniMusicStudio();
  const active = generationJobs.filter((j) => ["queued", "running", "paused"].includes(j.status));

  return (
    <div className="mb-3 space-y-1">
      <p className="text-[9px] uppercase text-slate-600">Generation Queue</p>
      {active.length === 0 ? <p className="text-[8px] text-slate-600">No active jobs</p> : null}
      {active.map((j) => (
        <div key={j.id} className="rounded border border-white/[0.06] p-2 text-[8px]">
          <div className="flex justify-between text-violet-200">
            <span>{j.workflow}</span>
            <span className="capitalize">{j.status}</span>
          </div>
          <div className="mt-1 h-1 rounded bg-black/40">
            <div className="h-full rounded bg-violet-500/50" style={{ width: `${j.progress}%` }} />
          </div>
          <p className="mt-1 text-slate-600">{j.providerId} · ~{j.estimatedSec}s · {j.priority}</p>
          <div className="mt-1 flex gap-2">
            {j.status === "running" ? <button type="button" onClick={() => pauseJob(j.id)} className="text-slate-500">Pause</button> : null}
            {j.status === "paused" ? <button type="button" onClick={() => resumeJob(j.id)} className="text-slate-500">Resume</button> : null}
            <button type="button" onClick={() => cancelJob(j.id)} className="text-slate-500">Cancel</button>
            {j.status === "failed" ? <button type="button" onClick={() => retryJob(j.id)} className="text-violet-400">Retry</button> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
