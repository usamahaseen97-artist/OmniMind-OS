"use client";

import type { HealthMetric } from "../../../lib/omniforge-enterprise";
import { useOmniForgeEnterprise } from "../../../lib/omniforge-enterprise-context";

export function OmniForgeProjectHealthPanel() {
  const ent = useOmniForgeEnterprise();
  const health = ent.health;

  if (!health) {
    return <p className="p-3 text-[10px] text-zinc-600">Health metrics update when files are scanned.</p>;
  }

  return (
    <div className="space-y-2 overflow-y-auto p-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase text-zinc-300">Project Health</span>
        <span className="text-lg font-bold text-cyan-300">{health.overall}</span>
      </div>
      {health.metrics.map((m: HealthMetric) => (
        <div key={m.id} className="rounded border border-white/10 px-2 py-1.5">
          <div className="flex justify-between text-[10px]">
            <span className="text-zinc-300">{m.label}</span>
            <span className={m.status === "critical" ? "text-red-400" : "text-zinc-400"}>{m.score}</span>
          </div>
          <p className="text-[9px] text-zinc-600">{m.detail}</p>
        </div>
      ))}
    </div>
  );
}
