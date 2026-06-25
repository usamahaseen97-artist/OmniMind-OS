"use client";

import { ANALYTICS_METRICS } from "../../../lib/visionary/marketing/constants";
import { useVisionaryMarketing } from "../../../lib/visionary/marketing-context";

export function AnalyticsDashboard() {
  const { analyticsSummary, analyticsSnapshots, activeCampaign } = useVisionaryMarketing();

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4">
      <p className="mb-1 text-[10px] font-semibold uppercase text-violet-400">Analytics Dashboard</p>
      <p className="mb-4 text-[9px] text-slate-600">
        {activeCampaign?.name ?? "All campaigns"} · Live Dashboard · Architecture stub
      </p>
      <div className="mb-4 grid grid-cols-5 gap-2">
        {ANALYTICS_METRICS.map((m) => (
          <div key={m.id} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-center">
            <p className="text-[8px] uppercase text-slate-600">{m.label}</p>
            <p className="mt-1 text-lg font-semibold text-white">
              {analyticsSummary[m.id]?.toLocaleString() ?? "—"}
            </p>
          </div>
        ))}
      </div>
      <p className="mb-2 text-[9px] uppercase text-slate-600">Performance Timeline</p>
      <div className="flex h-32 items-end gap-1">
        {analyticsSnapshots.map((s, i) => (
          <div
            key={s.id}
            className="flex-1 rounded-t bg-violet-500/40"
            style={{ height: `${30 + i * 12}%` }}
            title={`${s.metric}: ${s.value}`}
          />
        ))}
      </div>
      <p className="mt-4 text-[8px] text-slate-600">Heat maps · Campaign comparison · ROI — architecture stub</p>
    </div>
  );
}
