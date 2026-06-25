"use client";

import { useVisionaryAutomation } from "../../../lib/visionary/automation-context";
import { AUTOMATION_ACTIONS } from "../../../lib/visionary/automation/constants";

export function CreatorEngine() {
  const { runAutomation, automationJobs, projectHealth } = useVisionaryAutomation();

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-indigo-400">Omni Creator Engine</p>
      <p className="mb-4 text-[9px] text-slate-600">Generate · Edit · Organize · Automate · Publish — unified creative OS</p>

      <div className="mb-4 grid grid-cols-4 gap-2">
        <Stat label="Health" value={`${projectHealth.score}%`} />
        <Stat label="Assets" value={String(projectHealth.assetCount)} />
        <Stat label="Render Q" value={String(projectHealth.renderQueue)} />
        <Stat label="Publish Q" value={String(projectHealth.publishQueue)} />
      </div>

      <p className="mb-2 text-[9px] uppercase text-slate-600">Quick Automations</p>
      <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
        {AUTOMATION_ACTIONS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => runAutomation(a.id)}
            className="rounded border border-white/[0.06] px-2 py-2 text-left text-[8px] text-slate-500 hover:border-indigo-400/40 hover:text-indigo-200"
          >
            {a.label}
          </button>
        ))}
      </div>

      <p className="mb-2 mt-4 text-[9px] uppercase text-slate-600">Active Jobs</p>
      <ul className="space-y-1">
        {automationJobs.slice(0, 5).map((j) => (
          <li key={j.id} className="flex justify-between rounded bg-white/[0.03] px-2 py-1 text-[9px] text-slate-400">
            <span>{j.action}</span>
            <span className={j.status === "completed" ? "text-emerald-400" : "text-amber-400"}>{j.progress}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2 text-center">
      <p className="text-[8px] uppercase text-slate-600">{label}</p>
      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
