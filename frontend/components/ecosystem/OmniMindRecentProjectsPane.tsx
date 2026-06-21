"use client";

import { Archive, Clock, Copy, Download, Plus, RotateCcw } from "lucide-react";
import { useOmniMindEcosystem } from "../../lib/omnimind-ecosystem-context";

/** Recent projects + session snapshots + project manager actions. */
export function OmniMindRecentProjectsPane() {
  const {
    recentProjects,
    projectTabs,
    setActiveProjectTabId,
    addProjectTab,
    snapshots,
    restoreSnapshot,
    saveSnapshot,
    pushNotification,
  } = useOmniMindEcosystem();

  const list = recentProjects.length ? recentProjects : projectTabs;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2">
        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Recent Projects</span>
        <button
          type="button"
          onClick={() => addProjectTab("New Project")}
          className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[8px] text-cyan-400 hover:bg-white/[0.04]"
        >
          <Plus className="h-3 w-3" />
          New
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {list.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setActiveProjectTabId(p.id)}
            className="mb-1 flex w-full items-center gap-2 rounded border border-white/[0.06] px-2 py-2 text-left hover:border-cyan-500/20 hover:bg-white/[0.03]"
          >
            <Clock className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
            <div className="min-w-0">
              <p className="truncate text-[10px] text-zinc-300">{p.name}</p>
              <p className="text-[8px] text-zinc-600">{p.domain ?? "Project"}</p>
            </div>
          </button>
        ))}
      </div>
      <div className="border-t border-white/[0.06] p-2">
        <p className="mb-1 text-[8px] font-bold uppercase tracking-wider text-zinc-600">Sessions</p>
        <button
          type="button"
          onClick={() => saveSnapshot("Continue Last Session")}
          className="mb-1 flex w-full items-center gap-1 rounded px-2 py-1 text-[9px] text-zinc-400 hover:bg-white/[0.04]"
        >
          <RotateCcw className="h-3 w-3" />
          Save Session
        </button>
        {snapshots.slice(0, 4).map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => restoreSnapshot(s.id)}
            className="block w-full truncate px-2 py-0.5 text-left text-[8px] text-zinc-500 hover:text-cyan-300"
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1 border-t border-white/[0.06] p-2">
        {[
          { icon: Copy, label: "Clone", cmd: "project:clone" },
          { icon: Archive, label: "Archive", cmd: "project:archive" },
          { icon: Download, label: "Export", cmd: "project:export" },
        ].map(({ icon: Icon, label, cmd }) => (
          <button
            key={cmd}
            type="button"
            onClick={() => pushNotification(`${label} queued`, "info")}
            className="flex items-center gap-1 rounded border border-white/[0.06] px-1.5 py-0.5 text-[8px] text-zinc-500 hover:text-zinc-300"
          >
            <Icon className="h-3 w-3" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
