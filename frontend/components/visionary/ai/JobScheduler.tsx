"use client";

import { useVisionaryAI } from "../../../lib/visionary/ai-context";

/** Scheduled jobs from JobScheduler. */
export function JobScheduler() {
  const { engine } = useVisionaryAI();
  const tasks = engine.scheduler.list();

  return (
    <div className="p-2">
      <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-500">Job Scheduler</p>
      <ul className="mt-2 space-y-1">
        {tasks.length === 0 ? (
          <li className="text-[9px] text-slate-600">No scheduled tasks</li>
        ) : (
          tasks.map((t) => (
            <li key={t.id} className="rounded bg-white/[0.03] px-2 py-1 text-[9px] text-slate-400">
              {t.jobId} · {t.runAt.slice(11, 19)} · {t.cloudRender ? "cloud" : "local"}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
