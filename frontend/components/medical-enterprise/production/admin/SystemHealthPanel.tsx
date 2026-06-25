"use client";

import type { HealthDashboard } from "@/core/medical-enterprise/production/types";

export function SystemHealthPanel({ health }: { health: HealthDashboard | null }) {
  if (!health) return <p className="p-3 text-[9px] text-slate-500">Loading system health…</p>;

  return (
    <div className="p-2">
      <div className="mb-2 flex items-center justify-between rounded border border-white/[0.06] px-3 py-2">
        <span className="text-[9px] text-slate-400">Overall</span>
        <span className={`text-sm font-semibold ${health.overall === "healthy" ? "text-emerald-400" : "text-amber-300"}`}>
          {health.overall}
        </span>
      </div>
      <ul className="space-y-1">
        {health.services.map((s) => (
          <li key={s.id} className="flex items-center justify-between rounded border border-white/[0.06] px-2 py-1.5 text-[8px]">
            <span className="text-slate-300">{s.name}</span>
            <span className={s.health === "healthy" ? "text-emerald-400/80" : "text-amber-300"}>{s.health}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
