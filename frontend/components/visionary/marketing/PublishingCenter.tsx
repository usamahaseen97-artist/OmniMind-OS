"use client";

import { useVisionaryMarketing } from "../../../lib/visionary/marketing-context";

export function PublishingCenter() {
  const { publishJobs, socialPosts, queuePublish } = useVisionaryMarketing();

  return (
    <div className="flex h-full flex-col p-4">
      <p className="mb-3 text-[10px] font-semibold uppercase text-violet-400">Publishing Center</p>
      <div className="mb-4 flex gap-2">
        {socialPosts.filter((p) => p.status === "scheduled").map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => queuePublish(p.id, p.platform)}
            className="rounded bg-violet-600/80 px-2 py-1 text-[8px] text-white"
          >
            Publish {p.platform}
          </button>
        ))}
      </div>
      <p className="mb-2 text-[9px] uppercase text-slate-600">Queue</p>
      <ul className="space-y-1">
        {publishJobs.map((j) => (
          <li key={j.id} className="rounded bg-white/[0.03] px-2 py-1.5 text-[9px] text-slate-400">
            {j.platform} · {j.status} · {j.progress}%
          </li>
        ))}
        {publishJobs.length === 0 ? (
          <li className="text-[9px] text-slate-600">No jobs in queue</li>
        ) : null}
      </ul>
    </div>
  );
}
