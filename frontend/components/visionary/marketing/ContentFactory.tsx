"use client";

import { CONTENT_FORMATS } from "../../../lib/visionary/marketing/constants";
import { useVisionaryMarketing } from "../../../lib/visionary/marketing-context";
import type { ContentFormat } from "../../../lib/visionary/marketing/types";

export function ContentFactory() {
  const { contentItems, generateContent } = useVisionaryMarketing();

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4">
      <p className="mb-3 text-[10px] font-semibold uppercase text-violet-400">Content Factory</p>
      <div className="mb-4 grid grid-cols-4 gap-1 sm:grid-cols-6">
        {CONTENT_FORMATS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => generateContent(f.id as ContentFormat, f.label, `Generate ${f.label}`)}
            className="rounded border border-white/[0.06] px-1 py-2 text-[8px] text-slate-500 hover:border-violet-400/40 hover:text-violet-200"
          >
            {f.label}
          </button>
        ))}
      </div>
      <p className="mb-2 text-[9px] uppercase text-slate-600">Generation Queue</p>
      <ul className="space-y-2">
        {contentItems.map((item) => (
          <li key={item.id} className="flex items-center justify-between rounded border border-white/[0.04] px-3 py-2">
            <div>
              <p className="text-[10px] text-slate-300">{item.title}</p>
              <p className="text-[8px] text-slate-600">{item.format}</p>
            </div>
            <span className={`text-[8px] ${item.status === "ready" ? "text-emerald-400" : "text-amber-400"}`}>
              {item.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
