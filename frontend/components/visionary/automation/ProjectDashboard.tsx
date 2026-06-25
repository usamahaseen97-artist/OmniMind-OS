"use client";

import { useVisionaryAutomation } from "../../../lib/visionary/automation-context";

export function ProjectDashboard({ compact = false }: { compact?: boolean }) {
  const { projectHealth, activity, project } = useVisionaryAutomation();

  if (compact) {
    return (
      <div className="border-b border-white/[0.06] p-2">
        <p className="text-[9px] font-semibold uppercase text-slate-500">Dashboard</p>
        <p className="text-[10px] text-indigo-200">{project.name}</p>
        <p className="text-[8px] text-slate-600">Health {projectHealth.score}% · {projectHealth.openTasks} tasks</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <p className="mb-3 text-[10px] font-semibold uppercase text-indigo-400">Project Dashboard</p>
      <div className="mb-4 grid grid-cols-3 gap-2 text-[9px] text-slate-500">
        <div>Storage: {projectHealth.storageUsedMb}/{projectHealth.storageTotalMb} MB</div>
        <div>Assets: {projectHealth.assetCount}</div>
        <div>Tasks: {projectHealth.openTasks}</div>
      </div>
      <p className="mb-2 text-[9px] uppercase text-slate-600">Recent Activity</p>
      {activity.map((e) => (
        <p key={e.id} className="text-[8px] text-slate-600">{e.label}</p>
      ))}
    </div>
  );
}
