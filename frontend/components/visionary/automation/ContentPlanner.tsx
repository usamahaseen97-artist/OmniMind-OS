"use client";

export function ContentPlanner() {
  return (
    <div className="flex h-full flex-col p-4">
      <p className="mb-3 text-[10px] font-semibold uppercase text-indigo-400">Content Planner</p>
      <div className="grid flex-1 grid-cols-7 gap-1">
        {Array.from({ length: 28 }, (_, i) => (
          <div key={i} className="min-h-[50px] rounded border border-white/[0.04] bg-white/[0.02] p-1">
            <p className="text-[8px] text-slate-600">{i + 1}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[8px] text-slate-600">Campaign timeline · Publishing queue · Reminders</p>
    </div>
  );
}
