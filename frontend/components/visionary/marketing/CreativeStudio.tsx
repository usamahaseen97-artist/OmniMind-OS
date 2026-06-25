"use client";

import { COPY_TYPES } from "../../../lib/visionary/marketing/constants";
import { useVisionaryMarketing } from "../../../lib/visionary/marketing-context";

export function CreativeStudio() {
  const { copyDrafts, generateCopy, adCreatives } = useVisionaryMarketing();

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4">
      <p className="mb-3 text-[10px] font-semibold uppercase text-violet-400">Creative Studio · AI Copywriter</p>
      <div className="mb-4 flex flex-wrap gap-1">
        {COPY_TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => generateCopy(t.id, t.label)}
            className="rounded border border-white/[0.06] px-2 py-0.5 text-[8px] text-slate-500 hover:border-violet-400/40 hover:text-violet-200"
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="grid flex-1 grid-cols-2 gap-3">
        <div>
          <p className="mb-2 text-[9px] uppercase text-slate-600">Copy Drafts</p>
          <ul className="space-y-2">
            {copyDrafts.map((d) => (
              <li key={d.id} className="rounded border border-white/[0.04] p-2">
                <p className="text-[10px] font-medium text-slate-300">{d.title}</p>
                <p className="text-[8px] text-violet-400/80">{d.type}</p>
                <p className="mt-1 text-[9px] text-slate-500">{d.body}</p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-[9px] uppercase text-slate-600">Ad Variations · A/B Testing</p>
          {adCreatives.map((ad) => (
            <div key={ad.id} className="mb-2 rounded bg-white/[0.03] p-2">
              <p className="text-[10px] text-slate-300">{ad.headline}</p>
              <p className="text-[8px] text-slate-600">{ad.platform} · Group {ad.abTestGroup} · {ad.budgetShare}% budget</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
