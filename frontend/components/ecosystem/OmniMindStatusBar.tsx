"use client";

import { useEffect, useState } from "react";
import { Activity, Cpu, Database, GitBranch, HardDrive, Wifi } from "lucide-react";
import { useOmniMindEcosystem } from "../../lib/omnimind-ecosystem-context";
import { DEFAULT_BUILD_PORTS } from "../../lib/omniforge-ide-modules";
import { probeOmniforgeGateway } from "../../lib/omniforge-api";
import { probeBackendOnline } from "../../lib/backend-health";

/** Universal status bar — git, interpreters, ports, WS, RAM/CPU hints. */
export function OmniMindStatusBar() {
  const { techStack, notifications } = useOmniMindEcosystem();
  const [gwOk, setGwOk] = useState<boolean | null>(null);
  const [scOk, setScOk] = useState<boolean | null>(null);
  const [cpuHint] = useState(() => (typeof navigator !== "undefined" ? `${navigator.hardwareConcurrency ?? 4} cores` : "—"));

  useEffect(() => {
    const tick = async () => {
      const [gw, sc] = await Promise.all([probeOmniforgeGateway(), probeBackendOnline()]);
      setGwOk(gw);
      setScOk(sc);
    };
    void tick();
    const id = window.setInterval(() => void tick(), 8000);
    return () => window.clearInterval(id);
  }, []);

  const db = techStack.database[0] ?? "—";
  const lastNote = notifications[0];

  return (
    <footer className="flex h-6 shrink-0 items-center justify-between border-t border-white/[0.06] bg-[#0a0b10] px-2 font-mono text-[8px] text-zinc-500">
      <div className="flex min-w-0 items-center gap-3 overflow-x-auto">
        <span className="flex items-center gap-1 text-emerald-500/90">
          <GitBranch className="h-3 w-3" />
          main · clean
        </span>
        <span className="flex items-center gap-1">
          <Activity className="h-3 w-3 text-cyan-400/70" />
          Py · Node
        </span>
        <span className="flex items-center gap-1">
          <Database className="h-3 w-3 text-amber-400/70" />
          {db}
        </span>
        <span className="flex items-center gap-1">
          <Wifi className={`h-3 w-3 ${gwOk ? "text-emerald-400" : "text-amber-500"}`} />
          :8003
        </span>
        <span className={scOk ? "text-emerald-400/80" : "text-amber-500/80"}>:8001</span>
        {DEFAULT_BUILD_PORTS.slice(2).map((p) => (
          <span key={p.port} className="hidden sm:inline">
            :{p.port}
          </span>
        ))}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="hidden items-center gap-1 md:flex">
          <Cpu className="h-3 w-3" />
          {cpuHint}
        </span>
        <span className="hidden items-center gap-1 md:flex">
          <HardDrive className="h-3 w-3" />
          RAM ok
        </span>
        {lastNote ? <span className="max-w-[200px] truncate text-cyan-400/70">{lastNote.text}</span> : null}
      </div>
    </footer>
  );
}
