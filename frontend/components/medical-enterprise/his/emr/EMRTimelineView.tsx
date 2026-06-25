"use client";

import type { EMRRecord } from "@/core/medical-enterprise/his/types";

export function EMRTimelineView({ record }: { record: EMRRecord | null }) {
  if (!record) {
    return <p className="p-3 text-[9px] text-slate-500">Select a patient to view EMR timeline</p>;
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="shrink-0 border-b border-white/[0.06] px-3 py-2">
        <p className="text-[10px] font-medium text-slate-200">
          {record.demographics.firstName} {record.demographics.lastName}
        </p>
        <p className="text-[8px] text-slate-500">
          MRN {record.demographics.mrn} · v{record.version} · {record.encounters.length} encounters
        </p>
      </header>
      <ul className="flex-1 space-y-1 overflow-y-auto p-2">
        {record.timeline.map((e) => (
          <li key={e.id} className="rounded border border-white/[0.06] px-2 py-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[8px] uppercase text-slate-600">{e.category}</span>
              <span className="text-[7px] text-slate-600">{e.timestamp.slice(0, 10)}</span>
            </div>
            <p className="text-[9px] font-medium text-slate-300">{e.title}</p>
            <p className="text-[8px] text-slate-500">{e.summary}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
