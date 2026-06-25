"use client";

import { useVisionaryAutomation } from "../../../lib/visionary/automation-context";

export function TaskManager() {
  const { tasks, addTask, teamMembers } = useVisionaryAutomation();

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase text-indigo-400">Task Manager</p>
        <button type="button" onClick={() => addTask("New Task")} className="text-[9px] text-indigo-400">+ Task</button>
      </div>
      <p className="mb-2 text-[8px] text-slate-600">Team · Roles · Mentions · Live Collaboration — architecture</p>
      <ul className="space-y-2">
        {tasks.map((t) => (
          <li key={t.id} className="rounded border border-white/[0.04] px-2 py-1.5">
            <p className="text-[10px] text-slate-300">{t.title}</p>
            <p className="text-[8px] text-slate-600">
              {teamMembers.find((m) => m.id === t.assigneeId)?.name ?? "Unassigned"} · {t.status}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
