"use client";

import type { InternalAgent } from "../../../lib/omniforge-engineering/multi-agents";
import { useOmniForgeEnterpriseOptional } from "../../../lib/omniforge-enterprise-context";

export function OmniForgeTasksPanel() {
  const ent = useOmniForgeEnterpriseOptional();
  const agents = ent?.agents ?? [];

  return (
    <div className="overflow-y-auto p-3 text-[10px] text-zinc-500">
      <p className="mb-2 font-bold uppercase text-zinc-300">Agent Tasks</p>
      {agents.map((a: InternalAgent) => (
        <div key={a.id} className="mb-2 rounded border border-white/10 p-2">
          <p className="text-zinc-300">{a.title}</p>
          <p>{a.specialty}</p>
          <p className="text-[9px] text-zinc-600">Phases: {a.phases.join(", ")}</p>
        </div>
      ))}
    </div>
  );
}
