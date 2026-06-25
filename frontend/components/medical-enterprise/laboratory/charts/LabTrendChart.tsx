"use client";

import type { AnalyteTrend } from "@/core/medical-enterprise/laboratory/types";

export function LabTrendChart({ trends }: { trends: AnalyteTrend[] }) {
  if (!trends.length) {
    return <p className="p-3 text-[9px] text-slate-500">No trend data yet</p>;
  }

  return (
    <div className="space-y-2 p-2">
      {trends.slice(0, 6).map((t) => (
        <div key={t.analyte} className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-medium text-slate-200">{t.analyte}</span>
            <TrendBadge direction={t.direction} />
          </div>
          <div className="mt-1 flex h-8 items-end gap-0.5">
            {t.dataPoints.map((p, i) => {
              const max = Math.max(...t.dataPoints.map((d) => d.value), 1);
              const h = Math.max(4, (p.value / max) * 100);
              return (
                <div
                  key={`${p.reportId}-${i}`}
                  className="flex-1 rounded-t bg-cyan-500/40"
                  style={{ height: `${h}%` }}
                  title={`${p.value} @ ${p.timestamp.slice(0, 10)}`}
                />
              );
            })}
          </div>
          {t.percentChange !== undefined && (
            <p className="mt-1 text-[8px] text-slate-500">
              {t.percentChange > 0 ? "+" : ""}
              {t.percentChange.toFixed(1)}% from baseline
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function TrendBadge({ direction }: { direction: AnalyteTrend["direction"] }) {
  const colors: Record<AnalyteTrend["direction"], string> = {
    improving: "text-emerald-400",
    stable: "text-slate-400",
    declining: "text-amber-400",
    "insufficient-data": "text-slate-600",
  };
  return <span className={`text-[8px] ${colors[direction]}`}>{direction}</span>;
}
