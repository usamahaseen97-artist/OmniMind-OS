"use client";

import { useVisionaryMarketing } from "../../../lib/visionary/marketing-context";

export function BrandGuidelines() {
  const { brandGuidelines, brandIdentity } = useVisionaryMarketing();

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-2">
      <p className="mb-2 text-[9px] font-semibold uppercase text-slate-500">Brand Guidelines</p>
      <p className="mb-3 text-[10px] text-violet-200">{brandIdentity.companyName}</p>
      {brandGuidelines.map((g) => (
        <div key={g.id} className="mb-2 rounded border border-white/[0.04] p-2">
          <p className="text-[9px] font-medium text-slate-300">{g.section}</p>
          <p className="mt-0.5 text-[8px] text-slate-600">{g.content}</p>
        </div>
      ))}
      <p className="mt-auto text-[8px] text-slate-600">Brand voice · Business info · Shared assets</p>
    </div>
  );
}
