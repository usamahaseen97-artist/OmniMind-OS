"use client";

import { useVisionaryAutomation } from "../../../lib/visionary/automation-context";
import { ApprovalCenter } from "./ApprovalCenter";

export function ReviewWorkspace() {
  const { approvals, teamMembers } = useVisionaryAutomation();

  return (
    <div className="flex h-full gap-2 p-2">
      <div className="min-w-0 flex-1 overflow-y-auto p-2">
        <p className="mb-3 text-[10px] font-semibold uppercase text-indigo-400">Review Workspace</p>
        {approvals.map((a) => (
          <div key={a.id} className="mb-3 rounded-lg border border-white/[0.06] p-3">
            <p className="text-[11px] text-slate-300">{a.title}</p>
            <p className="text-[8px] text-slate-600">{a.type} · {a.status}</p>
            <div className="mt-2 flex gap-2">
              <button type="button" className="rounded bg-emerald-600/80 px-2 py-0.5 text-[8px] text-white">Approve</button>
              <button type="button" className="rounded border border-white/10 px-2 py-0.5 text-[8px] text-slate-500">Reject</button>
            </div>
          </div>
        ))}
      </div>
      <div className="w-48 shrink-0">
        <p className="mb-2 p-2 text-[9px] uppercase text-slate-600">Reviewers</p>
        {teamMembers.map((m) => (
          <p key={m.id} className="px-2 text-[9px] text-slate-500">{m.name} · {m.role}</p>
        ))}
        <ApprovalCenter compact />
      </div>
    </div>
  );
}
