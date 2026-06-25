"use client";

import { PUBLISH_PLATFORMS } from "../../../lib/visionary/automation/constants";
import { useVisionaryAutomation } from "../../../lib/visionary/automation-context";

export function PublishingHub() {
  const { publishJobs, schedulePublish, queuePublish } = useVisionaryAutomation();

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4">
      <p className="mb-3 text-[10px] font-semibold uppercase text-indigo-400">Publishing Hub</p>
      <div className="mb-4 grid grid-cols-3 gap-1">
        {PUBLISH_PLATFORMS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => schedulePublish(p.id, `${p.label} Post`)}
            className="rounded border border-white/[0.06] px-1 py-2 text-[8px] text-slate-500 hover:border-indigo-400/40"
          >
            {p.label}
          </button>
        ))}
      </div>
      <p className="mb-2 text-[9px] uppercase text-slate-600">Queue · Drafts · Approvals</p>
      <ul className="space-y-1">
        {publishJobs.map((j) => (
          <li key={j.id} className="flex items-center justify-between rounded bg-white/[0.03] px-2 py-1.5">
            <span className="text-[9px] text-slate-400">{j.platform} · {j.title}</span>
            <button type="button" onClick={() => queuePublish(j.id)} className="text-[8px] text-indigo-400">{j.status}</button>
          </li>
        ))}
        {publishJobs.length === 0 ? <li className="text-[9px] text-slate-600">No publish jobs — schedule above</li> : null}
      </ul>
    </div>
  );
}
