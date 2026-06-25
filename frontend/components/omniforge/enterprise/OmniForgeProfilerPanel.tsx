"use client";

import type { HealthMetric } from "../../../lib/omniforge-enterprise";
import { useOmniForgeEnterpriseOptional } from "../../../lib/omniforge-enterprise-context";

export function OmniForgeProfilerPanel() {
  const ent = useOmniForgeEnterpriseOptional();

  return (
    <div className="p-3 text-[10px] text-zinc-500">
      <p className="font-bold uppercase text-zinc-300">Profiler</p>
      <p className="mt-2">Bundle: {ent?.health?.metrics.find((m: HealthMetric) => m.id === "bundle")?.score ?? "—"}</p>
      <p>Performance: {ent?.health?.metrics.find((m: HealthMetric) => m.id === "performance")?.score ?? "—"}</p>
      <p className="mt-2 text-zinc-600">Parallel agents: 4 · Streaming: on · Cache: on</p>
    </div>
  );
}
