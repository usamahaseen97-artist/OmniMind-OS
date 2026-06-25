"use client";

import { Activity, Bot, FileCode, GitBranch, Rocket, TestTube, X } from "lucide-react";
import { useOmniForgeEnterprise } from "../../../lib/omniforge-enterprise-context";

export function OmniForgeEnterpriseDashboard() {
  const ent = useOmniForgeEnterprise();
  if (!ent.dashboardOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
      <div className="flex h-[min(88vh,720px)] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-white/10 bg-[#12141c] shadow-2xl">
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <h2 className="text-sm font-bold text-zinc-100">OmniForge Enterprise Dashboard</h2>
            <p className="text-[10px] text-zinc-500">{ent.activeWorkspace?.name ?? "Workspace"}</p>
          </div>
          <button type="button" onClick={ent.closeDashboard} className="text-zinc-500 hover:text-zinc-300">
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="grid min-h-0 flex-1 grid-cols-3 gap-3 overflow-y-auto p-4">
          <DashCard icon={Activity} title="Progress" value={`${ent.health?.overall ?? "—"}% health`} />
          <DashCard icon={Bot} title="Agents" value={`${ent.agents.length} active specialists`} />
          <DashCard icon={FileCode} title="Files" value={ent.blueprint ? `${ent.blueprint.folderStructure.length} paths planned` : "Run analyzer"} />
          <DashCard icon={GitBranch} title="Repositories" value={ent.workspaces.length + " workspace(s)"} />
          <DashCard icon={TestTube} title="Testing" value={`${ent.testSuites.length} suite(s)`} />
          <DashCard icon={Rocket} title="Deployments" value={ent.deployment?.label ?? "Not configured"} />
        </div>
        {ent.architectureDiagram ? (
          <pre className="mx-4 mb-4 max-h-32 overflow-auto rounded border border-white/10 bg-black/40 p-3 text-[9px] text-cyan-200/80">
            {ent.architectureDiagram}
          </pre>
        ) : null}
      </div>
    </div>
  );
}

function DashCard({ icon: Icon, title, value }: { icon: typeof Activity; title: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
      <div className="flex items-center gap-2 text-cyan-300">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[10px] font-bold uppercase tracking-wider">{title}</span>
      </div>
      <p className="mt-2 text-[11px] text-zinc-300">{value}</p>
    </div>
  );
}
