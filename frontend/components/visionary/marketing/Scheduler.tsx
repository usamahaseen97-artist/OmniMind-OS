"use client";

import { SOCIAL_PLATFORMS } from "../../../lib/visionary/marketing/constants";
import { useVisionaryMarketing } from "../../../lib/visionary/marketing-context";

export function Scheduler({ compact = false }: { compact?: boolean }) {
  const { socialPosts, schedulePost } = useVisionaryMarketing();

  if (compact) {
    return (
      <div className="border-t border-white/[0.06] p-2">
        <p className="mb-1 text-[8px] uppercase text-slate-600">Scheduler</p>
        <p className="text-[8px] text-slate-500">{socialPosts.length} scheduled</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <p className="mb-2 text-[9px] uppercase text-slate-600">Publishing Queue</p>
      {SOCIAL_PLATFORMS.slice(0, 4).map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => schedulePost(p.id, `${p.label} scheduled post`, new Date().toISOString())}
          className="mb-1 block w-full rounded border border-white/[0.06] px-2 py-1 text-left text-[9px] text-slate-500"
        >
          Queue {p.label}
        </button>
      ))}
    </div>
  );
}
