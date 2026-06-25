"use client";

import { useVisionaryAutomation } from "../../../lib/visionary/automation-context";

export function AIWorkflowCopilot() {
  const { copilotSuggestions, refreshCopilot } = useVisionaryAutomation();

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-2">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[9px] font-semibold uppercase text-indigo-400">AI Workflow Copilot</p>
        <button type="button" onClick={refreshCopilot} className="text-[8px] text-indigo-400">Refresh</button>
      </div>
      <ul className="space-y-2">
        {copilotSuggestions.map((s) => (
          <li key={s.id} className="rounded border border-indigo-500/20 bg-indigo-500/5 p-2">
            <p className="text-[9px] text-slate-300">{s.message}</p>
            {s.actionLabel ? (
              <button type="button" className="mt-1 text-[8px] text-indigo-300">{s.actionLabel}</button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
