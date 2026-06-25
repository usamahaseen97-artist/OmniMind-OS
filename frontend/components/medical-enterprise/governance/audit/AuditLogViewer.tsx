"use client";

import type { UnifiedAuditEvent } from "@/core/medical-enterprise/governance/types";

export function AuditLogViewer({ events }: { events: UnifiedAuditEvent[] }) {
  if (!events.length) {
    return <p className="p-3 text-[9px] text-slate-500">No audit events</p>;
  }

  return (
    <ul className="max-h-full space-y-1 overflow-y-auto p-2">
      {events.slice(0, 50).map((e) => (
        <li key={e.id} className="rounded border border-white/[0.06] px-2 py-1.5 text-[8px]">
          <div className="flex justify-between text-slate-600">
            <span>{e.timestamp.slice(0, 19)}</span>
            <span className="uppercase">{e.source}</span>
          </div>
          <p className="text-slate-300">
            <span className="text-slate-500">[{e.category}]</span> {e.action}
          </p>
          {e.patientId && <p className="text-slate-600">Patient: {e.patientId}</p>}
        </li>
      ))}
    </ul>
  );
}
