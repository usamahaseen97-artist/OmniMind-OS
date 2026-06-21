"use client";

import { Hammer, Play, Database, Cloud, Wifi, WifiOff } from "lucide-react";
import { useOmniForgeShell } from "../../../../../lib/omniforge-shell-context";
import { useOmniForgeWorkspaceOptional } from "../../../../../lib/omniforge-workspace";

/** Build/Run toolbar + architect status — appended above 4-panel grid. */
export function OmniForgeEngineToolbar({
  live,
  onBuild,
  onRun,
}: {
  live: boolean;
  onBuild?: () => void;
  onRun?: () => void;
}) {
  const {
    architectAnalysis,
    approvedDatabase,
    buildRunning,
    setBuildRunning,
    setActiveIdeModule,
  } = useOmniForgeShell();
  const omniforge = useOmniForgeWorkspaceOptional();

  const handleBuild = () => {
    setBuildRunning(true);
    onBuild?.();
    window.setTimeout(() => setBuildRunning(false), 1200);
  };

  const dbLabel = approvedDatabase ?? architectAnalysis?.database.recommended;

  return (
    <div className="flex h-8 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[rgba(12,14,20,0.98)] px-3">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={!live || buildRunning}
          onClick={handleBuild}
          className="flex items-center gap-1 rounded px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-zinc-300 transition hover:bg-white/[0.06] disabled:opacity-40"
        >
          <Hammer className="h-3 w-3 text-amber-400" />
          Build
        </button>
        <button
          type="button"
          disabled={!live}
          onClick={() => onRun?.()}
          className="flex items-center gap-1 rounded px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-zinc-300 transition hover:bg-white/[0.06] disabled:opacity-40"
        >
          <Play className="h-3 w-3 text-emerald-400" />
          Run
        </button>
        <span className="mx-1 h-3 w-px bg-white/10" />
        <button
          type="button"
          onClick={() => setActiveIdeModule("database")}
          className="flex items-center gap-1 rounded px-2 py-0.5 text-[9px] text-zinc-500 transition hover:bg-white/[0.04] hover:text-cyan-300"
        >
          <Database className="h-3 w-3" />
          {dbLabel ? dbLabel.toUpperCase() : "DB"}
        </button>
      </div>

      <div className="flex items-center gap-3 font-mono text-[8px] text-zinc-500">
        {architectAnalysis ? (
          <span className="text-cyan-400/80">
            {architectAnalysis.domain_label} · {architectAnalysis.languages.slice(0, 3).join(", ")}
          </span>
        ) : (
          <span>OmniForge Engine</span>
        )}
        <span className="flex items-center gap-1">
          {live ? <Wifi className="h-3 w-3 text-emerald-400" /> : <WifiOff className="h-3 w-3 text-amber-500" />}
          {live ? "online" : "offline"}
        </span>
        {omniforge?.projectId ? (
          <span className="flex items-center gap-1">
            <Cloud className="h-3 w-3" />
            {omniforge.projectId.slice(0, 8)}
          </span>
        ) : null}
      </div>
    </div>
  );
}
