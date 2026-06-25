"use client";

import { useOmniForgeEngineering } from "../../../lib/omniforge-engineering-context";
import { activeAgentLabel } from "../../../lib/omniforge-engineering/multi-agents";
import type { InternalAgentId } from "../../../lib/omniforge-engineering/types";

export function OmniForgeLiveBuildPanel() {
  const { buildStages, buildActive, autoFixLog } = useOmniForgeEngineering();
  if (!buildActive && buildStages.every((s) => s.status === "pending")) return null;

  const active = buildStages.find((s) => s.status === "active");

  return (
    <div className="shrink-0 border-b border-white/[0.06] bg-[rgba(10,12,18,0.98)] px-3 py-2">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Live Build</span>
        {active?.agentId ? (
          <span className="text-[8px] text-cyan-400/80">{activeAgentLabel(active.agentId as InternalAgentId)} · {active.message ?? ""}</span>
        ) : null}
      </div>
      <div className="flex gap-1 overflow-x-auto pb-0.5">
        {buildStages.map((stage) => (
          <div
            key={stage.id}
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide ${
              stage.status === "active"
                ? "bg-cyan-500/20 text-cyan-200 ring-1 ring-cyan-400/40 animate-pulse"
                : stage.status === "done"
                  ? "bg-emerald-500/15 text-emerald-300"
                  : stage.status === "error"
                    ? "bg-red-500/15 text-red-300"
                    : "bg-white/5 text-zinc-600"
            }`}
          >
            {stage.label}
          </div>
        ))}
      </div>
      {autoFixLog.length > 0 ? (
        <div className="mt-1.5 max-h-12 overflow-y-auto font-mono text-[8px] text-amber-300/90">
          {autoFixLog.slice(-3).map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
