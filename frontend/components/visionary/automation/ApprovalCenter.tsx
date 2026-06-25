"use client";

import { useVisionaryAutomation } from "../../../lib/visionary/automation-context";

export function ApprovalCenter({ compact = false }: { compact?: boolean }) {
  const { approvals, requestApproval } = useVisionaryAutomation();

  return (
    <div className={compact ? "border-t border-white/[0.06] p-2" : "p-4"}>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[9px] uppercase text-slate-600">Approvals</p>
        {!compact ? (
          <button type="button" onClick={() => requestApproval("New Review", "asset")} className="text-[8px] text-indigo-400">+ Request</button>
        ) : null}
      </div>
      <ul className="space-y-1">
        {approvals.map((a) => (
          <li key={a.id} className="rounded bg-white/[0.03] px-2 py-1 text-[8px] text-slate-500">
            {a.title} · {a.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
