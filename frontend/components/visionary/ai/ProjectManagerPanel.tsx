"use client";

import { Folder, Layers } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useVisionaryAI } from "../../../lib/visionary/ai-context";

/** Multi-project system — collections, folders, versions, cloud sync. */
export function ProjectManagerPanel() {
  const {
    aiProjects,
    activeAIProjectId,
    setActiveAIProjectId,
    collections,
    folders,
    syncCloud,
    cloudSyncing,
    engine,
  } = useVisionaryAI();

  const cloudState = engine.cloudSync.getState();

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-500">Projects</p>
        <button
          type="button"
          onClick={() => void syncCloud()}
          disabled={cloudSyncing}
          className="rounded border border-cyan-500/30 px-2 py-0.5 text-[9px] text-cyan-300 hover:bg-cyan-500/10 disabled:opacity-50"
        >
          {cloudSyncing ? "Syncing…" : "Cloud Sync"}
        </button>
      </div>

      <p className="text-[9px] text-slate-600">
        Cloud: {cloudState.status} · {cloudState.pendingUploads} pending uploads
      </p>

      <ul className="space-y-1">
        {aiProjects.map((proj) => (
          <li key={proj.id}>
            <button
              type="button"
              onClick={() => setActiveAIProjectId(proj.id)}
              className={cn(
                "w-full rounded border px-3 py-2 text-left",
                activeAIProjectId === proj.id
                  ? "border-cyan-500/30 bg-cyan-500/10"
                  : "border-white/[0.06] bg-white/[0.02] hover:border-white/10",
              )}
            >
              <p className="text-[11px] font-medium text-slate-200">{proj.name}</p>
              <p className="text-[9px] text-slate-600">
                v{proj.version} · {proj.cloudSynced ? "synced" : "local"}
              </p>
            </button>
          </li>
        ))}
      </ul>

      <section>
        <p className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-slate-600">
          <Layers size={10} /> Collections
        </p>
        <ul className="mt-1 space-y-1">
          {collections.map((c) => (
            <li key={c.id} className="rounded bg-white/[0.03] px-2 py-1.5 text-[10px] text-slate-400">
              {c.name} · {c.projectIds.length} projects
            </li>
          ))}
        </ul>
      </section>

      <section>
        <p className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-slate-600">
          <Folder size={10} /> Folders
        </p>
        <ul className="mt-1 space-y-1">
          {folders.map((f) => (
            <li key={f.id} className="rounded bg-white/[0.03] px-2 py-1.5 text-[10px] text-slate-400">
              {f.name}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
