"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Activity,
  Bot,
  Cpu,
  FolderKanban,
  Gauge,
  LayoutDashboard,
  ScrollText,
  Shield,
  Terminal,
  Zap,
} from "lucide-react";
import { omniCore } from "../../core/omnicore/OmniCore";
import type { MissionControlDashboard } from "../../core/mission-control/types";
import { TERMINAL_LABELS } from "../../core/mission-control/constants";
import { cn } from "../../lib/utils";

type Tab = "overview" | "ai" | "projects" | "terminals" | "background" | "resources" | "security" | "logs" | "analytics" | "actions";

export function OmniMissionControlWorkspace() {
  const [tab, setTab] = useState<Tab>("overview");
  const [dash, setDash] = useState<MissionControlDashboard | null>(null);

  useEffect(() => {
    const load = () => {
      if (document.hidden) return;
      void omniCore.missionControl.dashboard().then(setDash);
    };

    let intervalId: number | undefined;

    const startPolling = () => {
      if (intervalId != null) return;
      intervalId = window.setInterval(load, 12000);
    };

    const stopPolling = () => {
      if (intervalId == null) return;
      window.clearInterval(intervalId);
      intervalId = undefined;
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
        return;
      }
      load();
      startPolling();
    };

    void omniCore.boot();
    load();
    startPolling();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  const tabs: { id: Tab; label: string; icon: typeof Gauge }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "ai", label: "AI Center", icon: Bot },
    { id: "projects", label: "Projects", icon: FolderKanban },
    { id: "terminals", label: "Terminals", icon: Terminal },
    { id: "background", label: "Background", icon: Activity },
    { id: "resources", label: "Resources", icon: Cpu },
    { id: "security", label: "Security", icon: Shield },
    { id: "logs", label: "Logs", icon: ScrollText },
    { id: "analytics", label: "Analytics", icon: Gauge },
    { id: "actions", label: "Quick Actions", icon: Zap },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#06080d] text-zinc-100">
      <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        <Gauge className="h-5 w-5 text-cyan-400" />
        <div>
          <h1 className="text-sm font-semibold">Mission Control</h1>
          <p className="text-[10px] text-zinc-500">OmniMind V2.0 — AI Operating Center</p>
        </div>
        {dash ? (
          <div className="ml-auto flex gap-3 text-[10px]">
            <ScorePill label="Health" value={dash.health.overall} />
            <ScorePill label="AI" value={dash.health.ai} />
            <ScorePill label="Security" value={dash.health.security} />
          </div>
        ) : null}
      </header>

      <div className="flex min-h-0 flex-1">
        <nav className="w-44 shrink-0 border-r border-white/10 p-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "mb-1 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[10px]",
                tab === t.id ? "bg-cyan-500/15 text-cyan-200" : "text-zinc-500 hover:bg-white/5",
              )}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </nav>

        <main className="history-scroll-hover min-h-0 flex-1 overflow-y-auto p-4">
          {!dash ? <p className="text-sm text-zinc-500">Loading mission data…</p> : null}
          {dash && tab === "overview" ? <OverviewPanel dash={dash} /> : null}
          {dash && tab === "ai" ? <AIPanel dash={dash} /> : null}
          {dash && tab === "projects" ? <ProjectsPanel dash={dash} /> : null}
          {dash && tab === "terminals" ? <TerminalsPanel /> : null}
          {dash && tab === "background" ? <BackgroundPanel dash={dash} /> : null}
          {dash && tab === "resources" ? <ResourcesPanel dash={dash} /> : null}
          {dash && tab === "security" ? <SecurityPanel dash={dash} /> : null}
          {dash && tab === "logs" ? <LogsPanel /> : null}
          {dash && tab === "analytics" ? <AnalyticsPanel /> : null}
          {dash && tab === "actions" ? <ActionsPanel dash={dash} /> : null}
        </main>
      </div>
    </div>
  );
}

function ScorePill({ label, value }: { label: string; value: number }) {
  return (
    <span className="rounded border border-white/10 px-2 py-0.5">
      {label}: <strong className="text-cyan-300">{value}</strong>
    </span>
  );
}

function OverviewPanel({ dash }: { dash: MissionControlDashboard }) {
  const s = dash.system;
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <Card title="Live System Status">
        <Row label="API" value={s.api} />
        <Row label="Database" value={s.database} />
        <Row label="Gateway" value={s.gateway} />
        <Row label="Cloud" value={s.cloud} />
        <Row label="RAM" value={s.ramUsedMb != null ? `${s.ramUsedMb} MB` : "—"} />
        <Row label="Storage" value={s.storageUsedGb != null ? `${s.storageUsedGb} GB` : "—"} />
      </Card>
      <Card title="Workspace">
        <Row label="Active project" value={dash.workspace.activeProjectId ?? "none"} />
        <Row label="Projects" value={String(dash.workspace.toolCount)} />
        <Row label="Session" value={dash.workspace.sessionId ?? "—"} />
      </Card>
      <Card title="AI Overview">
        <Row label="Requests" value={String(dash.ai.requestCount)} />
        <Row label="Latency p50" value={`${dash.ai.latencyP50}ms`} />
        <Row label="Agents" value={String(dash.ai.agents.length)} />
      </Card>
      <Card title="Health Scores">
        <Row label="Performance" value={String(dash.health.performance)} />
        <Row label="Reliability" value={String(dash.health.reliability)} />
        <Row label="Infrastructure" value={String(dash.health.infrastructure)} />
      </Card>
    </div>
  );
}

function AIPanel({ dash }: { dash: MissionControlDashboard }) {
  return (
    <div className="space-y-2">
      {dash.ai.agents.map((a) => (
        <div key={a.id} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-xs">
          <Bot className="h-4 w-4 text-violet-400" />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-zinc-200">{a.name}</p>
            <p className="text-[10px] text-zinc-500">{a.state} · {a.toolSlug}</p>
          </div>
          <div className="flex gap-1">
            <CtlBtn label="Pause" onClick={() => void omniCore.missionControl.aiCenter.pause(a.id)} />
            <CtlBtn label="Resume" onClick={() => void omniCore.missionControl.aiCenter.resume(a.id)} />
            <CtlBtn label="Cancel" onClick={() => void omniCore.missionControl.aiCenter.cancel(a.id)} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectsPanel({ dash }: { dash: MissionControlDashboard }) {
  return (
    <div className="space-y-2">
      {dash.projects.map((p) => (
        <div key={p.projectId} className="rounded-lg border border-white/10 p-3 text-xs">
          <p className="font-medium text-zinc-200">{p.name}</p>
          <p className="text-zinc-500">Health {p.healthScore} · {p.deploymentStatus} · {p.assetCount} assets</p>
          <p className="mt-1 truncate text-[10px] text-zinc-600">{p.aiContextPreview}</p>
        </div>
      ))}
    </div>
  );
}

function TerminalsPanel() {
  const [lines, setLines] = useState(omniCore.missionControl.terminals.lines);
  useEffect(() => {
    void omniCore.missionControl.terminals.refresh().then(setLines);
  }, []);
  return (
    <div className="space-y-3">
      {Object.entries(TERMINAL_LABELS).map(([kind, label]) => (
        <div key={kind} className="rounded-lg border border-white/10 bg-black/40 p-2 font-mono text-[10px]">
          <p className="mb-1 text-cyan-400">{label}</p>
          {lines
            .filter((l) => l.terminal === kind)
            .slice(0, 5)
            .map((l) => (
              <div key={l.id} className="text-zinc-500">
                [{l.level}] {l.text}
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}

function BackgroundPanel({ dash }: { dash: MissionControlDashboard }) {
  return (
    <ul className="space-y-1 text-xs">
      {dash.backgroundJobs.map((j) => (
        <li key={j.id} className="flex justify-between rounded border border-white/5 px-2 py-1.5">
          <span>{j.label}</span>
          <span className="text-zinc-500">{j.kind} · {j.progress}%</span>
        </li>
      ))}
    </ul>
  );
}

function ResourcesPanel({ dash }: { dash: MissionControlDashboard }) {
  const r = dash.resources;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Card title="Compute"><Row label="CPU" value={r.cpuPercent != null ? `${r.cpuPercent}%` : "—"} /><Row label="GPU" value={r.gpuPercent != null ? `${r.gpuPercent}%` : "—"} /></Card>
      <Card title="Usage"><Row label="Tokens" value={String(r.tokenUsage)} /><Row label="AI cost" value={`$${r.aiCostUsd.toFixed(4)}`} /><Row label="Workers" value={String(r.workers)} /></Card>
    </div>
  );
}

function SecurityPanel({ dash }: { dash: MissionControlDashboard }) {
  const s = dash.security;
  return (
    <div>
      <p className="mb-2 text-xs text-zinc-400">Threats: {s.threats} · Failed logins: {s.failedLogins}</p>
      <ul className="space-y-1 text-[10px]">
        {s.events.map((e) => (
          <li key={e.id} className="text-zinc-500">[{e.severity}] {e.detail}</li>
        ))}
      </ul>
    </div>
  );
}

function LogsPanel() {
  const [logs, setLogs] = useState(omniCore.missionControl.logs.entries);
  useEffect(() => {
    void omniCore.missionControl.logs.refresh().then(setLogs);
  }, []);
  return (
    <ul className="space-y-0.5 font-mono text-[10px]">
      {logs.slice(0, 40).map((l) => (
        <li key={l.id} className="text-zinc-500">[{l.source}] {l.message}</li>
      ))}
    </ul>
  );
}

function AnalyticsPanel() {
  const [series, setSeries] = useState<Awaited<ReturnType<typeof omniCore.missionControl.analytics.series>>>([]);
  useEffect(() => {
    void omniCore.missionControl.analytics.series().then(setSeries);
  }, []);
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {series.map((s) => (
        <Card key={s.label} title={s.label}>
          <p className="text-xs text-zinc-500">Latest: {s.points[s.points.length - 1]?.v ?? 0}</p>
        </Card>
      ))}
    </div>
  );
}

function ActionsPanel({ dash }: { dash: MissionControlDashboard }) {
  return (
    <div className="flex flex-wrap gap-2">
      {dash.quickActions.map((a) => (
        <button
          key={a.id}
          type="button"
          onClick={() => void omniCore.missionControl.actions.run(a.id)}
          className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-200 hover:bg-cyan-500/20"
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-cyan-400/90">{title}</h3>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[10px] text-zinc-400">
      <span>{label}</span>
      <span className="text-zinc-200">{value}</span>
    </div>
  );
}

function CtlBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="rounded border border-white/10 px-1.5 py-0.5 text-[9px] text-zinc-400 hover:text-cyan-300">
      {label}
    </button>
  );
}
