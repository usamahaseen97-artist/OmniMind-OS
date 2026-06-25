"use client";

import { PIPELINE_STAGES } from "../../../lib/visionary/automation/constants";
import { useVisionaryAutomation } from "../../../lib/visionary/automation-context";

export function AssetPipeline() {
  const { pipelineRun, startPipeline, advancePipeline } = useVisionaryAutomation();

  return (
    <div className="flex h-full flex-col p-4">
      <p className="mb-3 text-[10px] font-semibold uppercase text-indigo-400">Content Pipeline</p>
      <div className="mb-4 flex gap-2">
        <button type="button" onClick={startPipeline} className="rounded bg-indigo-600/80 px-3 py-1 text-[9px] text-white">Start Pipeline</button>
        <button type="button" onClick={advancePipeline} disabled={!pipelineRun} className="rounded border border-white/10 px-3 py-1 text-[9px] text-slate-400 disabled:opacity-40">Advance Stage</button>
      </div>
      <div className="space-y-1">
        {PIPELINE_STAGES.map((s) => {
          const st = pipelineRun?.stages.find((x) => x.stage === s.id);
          return (
            <div key={s.id} className="flex items-center gap-2 rounded border border-white/[0.04] px-2 py-1.5">
              <span className={`h-2 w-2 rounded-full ${st?.status === "done" ? "bg-emerald-400" : st?.status === "active" ? "bg-indigo-400" : "bg-slate-700"}`} />
              <span className="text-[10px] text-slate-400">{s.label}</span>
              {s.id !== "project" ? <span className="ml-auto text-[8px] text-slate-600">↓</span> : null}
            </div>
          );
        })}
      </div>
      {pipelineRun ? <p className="mt-4 text-[9px] text-indigo-300">Progress: {pipelineRun.progress}%</p> : null}
    </div>
  );
}
