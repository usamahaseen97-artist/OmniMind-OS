"use client";

import { Cloud } from "lucide-react";
import { useVisionaryAI } from "../../../lib/visionary/ai-context";

/** Cloud asset sync status and controls. */
export function CloudAssetSync() {
  const { syncCloud, cloudSyncing, engine } = useVisionaryAI();
  const state = engine.cloudSync.getState();

  return (
    <div className="flex items-center justify-between rounded border border-white/[0.06] bg-white/[0.02] px-3 py-2">
      <div className="flex items-center gap-2">
        <Cloud size={14} className={state.status === "synced" ? "text-emerald-400" : "text-amber-400"} />
        <div>
          <p className="text-[10px] text-slate-300">Cloud Assets</p>
          <p className="text-[8px] text-slate-600">
            {state.status} · ↑{state.pendingUploads} ↓{state.pendingDownloads}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => void syncCloud()}
        disabled={cloudSyncing}
        className="rounded border border-cyan-500/30 px-2 py-1 text-[9px] text-cyan-300 disabled:opacity-50"
      >
        Sync
      </button>
    </div>
  );
}
