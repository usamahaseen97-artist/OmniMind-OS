"use client";

import { useEffect, useState } from "react";
import { cn } from "../../../lib/utils";
import { useVisionaryAI } from "../../../lib/visionary/ai-context";
import type { ModelProviderDescriptor, ModelProviderId } from "../../../lib/visionary/ai/types";

/** Provider-independent model routing UI. */
export function ModelRouter({ compact = false }: { compact?: boolean }) {
  const { activeWorkflow, preferredProvider, setPreferredProvider, engine } = useVisionaryAI();
  const [providers, setProviders] = useState<ModelProviderDescriptor[]>([]);
  const route = engine.modelRouter.resolve(activeWorkflow);

  useEffect(() => {
    void engine.modelRouter.listProvidersWithStatus().then(setProviders);
  }, [engine, activeWorkflow]);

  const compatible = engine.modelRouter.providersForWorkflow(activeWorkflow);

  return (
    <div className={cn("visionary-model-router", compact ? "p-2" : "p-3")}>
      {!compact ? (
        <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-500">Model Router</p>
      ) : null}
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <select
          value={preferredProvider}
          onChange={(e) => setPreferredProvider(e.target.value as ModelProviderId | "auto")}
          className="rounded border border-white/[0.08] bg-black/40 px-2 py-1 text-[10px] text-slate-200"
        >
          <option value="auto">Auto route</option>
          {compatible.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <span className="text-[9px] text-slate-600">
          → <span className="text-cyan-400/80">{route.providerId}</span>
          <span className="text-slate-700"> · {route.modelHint}</span>
        </span>
      </div>
      {!compact ? (
        <ul className="mt-3 grid grid-cols-2 gap-1">
          {providers.map((p) => (
            <li
              key={p.id}
              className={cn(
                "rounded border px-2 py-1.5 text-[9px]",
                p.workflows.includes(activeWorkflow)
                  ? "border-cyan-500/20 bg-cyan-500/5 text-slate-300"
                  : "border-white/[0.04] text-slate-600 opacity-60",
              )}
            >
              <span className="font-medium">{p.label}</span>
              <span
                className={cn(
                  "ml-1 rounded px-1 text-[8px]",
                  p.status === "available" && "bg-emerald-500/15 text-emerald-400",
                  p.status === "unconfigured" && "bg-amber-500/15 text-amber-400",
                  p.status === "offline" && "bg-slate-500/15 text-slate-500",
                )}
              >
                {p.status}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
