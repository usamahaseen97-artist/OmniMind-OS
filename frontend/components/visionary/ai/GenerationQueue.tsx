"use client";

import { Cloud, Pause, Play, Square, Zap } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useVisionaryAI } from "../../../lib/visionary/ai-context";
import { AI_WORKFLOWS } from "../../../lib/visionary/ai-context";

/** Background generation queue with GPU status and cloud render flags. */
export function GenerationQueue({ full = false }: { full?: boolean }) {
  const {
    queueJobs,
    pauseJob,
    resumeJob,
    cancelJob,
    pauseAll,
    resumeAll,
    engine,
  } = useVisionaryAI();

  const gpuUtil = engine.inference.aggregateUtilization();
  const active = queueJobs.filter((j) => j.status === "processing" || j.status === "queued");
  const display = full ? queueJobs : queueJobs.slice(0, 5);

  return (
    <div className={cn("flex flex-col", full ? "h-full" : "max-h-48")}>
      <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-3 py-2">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-500">Generation Queue</p>
          <p className="text-[10px] text-slate-400">{active.length} active · GPU {gpuUtil}%</p>
        </div>
        <div className="flex gap-1">
          <button type="button" onClick={pauseAll} className="visionary-timeline-btn" title="Pause all">
            <Pause size={12} />
          </button>
          <button type="button" onClick={resumeAll} className="visionary-timeline-btn" title="Resume all">
            <Play size={12} />
          </button>
        </div>
      </div>

      <ul className="min-h-0 flex-1 overflow-y-auto p-2 space-y-1">
        {display.length === 0 ? (
          <li className="py-8 text-center text-[10px] text-slate-600">No jobs in queue</li>
        ) : (
          display.map((job) => (
            <li
              key={job.id}
              className="rounded border border-white/[0.06] bg-white/[0.02] p-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-medium text-slate-200">
                    {AI_WORKFLOWS.find((w) => w.id === job.workflow)?.label ?? job.workflow}
                  </p>
                  <p className="truncate text-[9px] text-slate-600">{job.prompt.positive.slice(0, 60)}</p>
                  <div className="mt-1 flex flex-wrap gap-2 text-[8px] text-slate-500">
                    <span className={statusColor(job.status)}>{job.status}</span>
                    <span>{job.providerId}</span>
                    {job.cloudRender ? (
                      <span className="flex items-center gap-0.5 text-cyan-400">
                        <Cloud size={8} /> cloud
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5">
                        <Zap size={8} /> {job.gpuSlot ?? "local"}
                      </span>
                    )}
                    {job.estimatedSecondsRemaining != null && job.status === "processing" ? (
                      <span>~{job.estimatedSecondsRemaining}s</span>
                    ) : null}
                  </div>
                </div>
                <div className="flex shrink-0 gap-0.5">
                  {job.status === "processing" || job.status === "queued" ? (
                    <button type="button" onClick={() => pauseJob(job.id)} className="visionary-timeline-btn">
                      <Pause size={11} />
                    </button>
                  ) : null}
                  {job.status === "paused" ? (
                    <button type="button" onClick={() => resumeJob(job.id)} className="visionary-timeline-btn">
                      <Play size={11} />
                    </button>
                  ) : null}
                  {job.status !== "completed" && job.status !== "cancelled" ? (
                    <button type="button" onClick={() => cancelJob(job.id)} className="visionary-timeline-btn text-rose-400">
                      <Square size={11} />
                    </button>
                  ) : null}
                </div>
              </div>
              {(job.status === "processing" || job.status === "queued") && (
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-black/40">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 transition-all"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function statusColor(status: string) {
  const map: Record<string, string> = {
    queued: "text-slate-400",
    processing: "text-cyan-400",
    paused: "text-amber-400",
    completed: "text-emerald-400",
    failed: "text-rose-400",
    cancelled: "text-slate-600",
  };
  return map[status] ?? "text-slate-500";
}
