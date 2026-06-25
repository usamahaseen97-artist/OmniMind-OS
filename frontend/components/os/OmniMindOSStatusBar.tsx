"use client";

import { useEffect, useState } from "react";
import { Activity, Cpu, Database, GitBranch, HardDrive, Server, Wifi, Zap } from "lucide-react";
import type { SovereignToolDef } from "../../lib/sovereign-tool-registry";
import { useOmniMindEcosystem } from "../../lib/omnimind-ecosystem-context";
import { useWorkspaceEngineOptional } from "../../lib/workspace-engine-context";
import { probeOmniforgeGateway } from "../../lib/omniforge-api";
import { probeBackendOnline } from "../../lib/backend-health";
import { WORKSPACE_PROFILES } from "../../lib/omnimind-ecosystem-registry";
import { OS_TOKENS } from "./tokens";

type OmniMindOSStatusBarProps = {
  tool?: SovereignToolDef;
};

/** Universal bottom status bar — services, memory, workspace, project. */
export function OmniMindOSStatusBar({ tool }: OmniMindOSStatusBarProps) {
  const { techStack, notifications, workspaceProfile, projectTabs, activeProjectTabId } =
    useOmniMindEcosystem();
  const engine = useWorkspaceEngineOptional();
  const [fastApiOk, setFastApiOk] = useState<boolean | null>(null);
  const [omniforgeOk, setOmniforgeOk] = useState<boolean | null>(null);
  const [cpuHint] = useState(() =>
    typeof navigator !== "undefined" ? `${navigator.hardwareConcurrency ?? 4} cores` : "—",
  );

  const activeTab = projectTabs.find((t) => t.id === activeProjectTabId);
  const profileLabel = WORKSPACE_PROFILES.find((p) => p.id === workspaceProfile)?.label ?? "Personal";
  const db = techStack.database[0] ?? "MongoDB";
  const lastNote = notifications[0];

  useEffect(() => {
    const tick = async () => {
      const [sc, omni] = await Promise.all([probeBackendOnline(), probeOmniforgeGateway()]);
      setFastApiOk(sc);
      setOmniforgeOk(omni);
    };
    void tick();
    const id = window.setInterval(() => void tick(), 8000);
    return () => window.clearInterval(id);
  }, []);

  const dot = (ok: boolean | null) =>
    ok === null ? "text-zinc-600" : ok ? "text-emerald-400" : "text-amber-500";

  return (
    <footer
      className="flex h-6 shrink-0 items-center justify-between border-t px-2 font-mono text-[8px] text-zinc-500"
      style={{ borderColor: OS_TOKENS.border.subtle, background: OS_TOKENS.bg.status }}
    >
      <div className="flex min-w-0 items-center gap-2 overflow-x-auto sm:gap-3">
        <span className={dot(fastApiOk)}>
          <Activity className="mr-0.5 inline h-3 w-3" />
          FastAPI :8001
        </span>
        <span className={dot(omniforgeOk)}>
          <Zap className="mr-0.5 inline h-3 w-3" />
          OmniForge :8003
        </span>
        <span className="hidden text-zinc-600 sm:inline">
          <Server className="mr-0.5 inline h-3 w-3" />
          Node :8091
        </span>
        <span className="hidden text-zinc-600 md:inline">
          <Server className="mr-0.5 inline h-3 w-3" />
          Go :8080
        </span>
        <span className="hidden text-amber-400/80 md:inline">
          <Database className="mr-0.5 inline h-3 w-3" />
          {db}
        </span>
        <span className={dot(omniforgeOk)}>
          <Wifi className="mr-0.5 inline h-3 w-3" />
          WS
        </span>
        <span className="hidden items-center gap-1 lg:inline-flex">
          <GitBranch className="h-3 w-3 text-emerald-500/80" />
          main
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <span className="hidden md:inline">
          <Cpu className="mr-0.5 inline h-3 w-3" />
          {cpuHint}
        </span>
        <span className="hidden lg:inline">
          <HardDrive className="mr-0.5 inline h-3 w-3" />
          RAM ok
        </span>
        <span className="max-w-[80px] truncate text-cyan-400/70">{profileLabel}</span>
        {engine ? (
          <span className="hidden text-zinc-500 sm:inline">
            {engine.tabs.length} tab{engine.tabs.length === 1 ? "" : "s"} · {engine.splitMode}
          </span>
        ) : null}
        {tool ? <span className="hidden max-w-[100px] truncate sm:inline">{tool.name}</span> : null}
        {activeTab ? (
          <span className="hidden max-w-[120px] truncate text-zinc-400 xl:inline">{activeTab.name}</span>
        ) : null}
        {lastNote ? <span className="max-w-[160px] truncate text-cyan-400/60">{lastNote.text}</span> : null}
      </div>
    </footer>
  );
}
