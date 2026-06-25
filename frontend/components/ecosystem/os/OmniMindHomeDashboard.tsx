"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bot,
  Calendar,
  FileText,
  Heart,
  LayoutGrid,
  Pin,
  Rocket,
  Sparkles,
  Target,
} from "lucide-react";
import { omniCore } from "../../../core/omnicore/OmniCore";
import type { HomeDashboardSnapshot } from "../../../core/ecosystem/types";
import { OSCard } from "./OSCard";
import { cn } from "../../../lib/utils";

type OmniMindHomeDashboardProps = {
  onContinueChat?: () => void;
  onOpenHub?: () => void;
  className?: string;
};

export function OmniMindHomeDashboard({ onContinueChat, onOpenHub, className }: OmniMindHomeDashboardProps) {
  const [data, setData] = useState<HomeDashboardSnapshot | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      omniCore.boot();
      const snap = await omniCore.ecosystem.home.snapshot();
      if (!cancelled) setData(snap);
    };
    void load();
    const id = window.setInterval(() => void load(), 30000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  if (!data) {
    return (
      <div className={cn("flex h-full items-center justify-center text-sm text-zinc-500", className)}>
        Loading OmniMind Home…
      </div>
    );
  }

  return (
    <div className={cn("history-scroll-hover h-full overflow-y-auto bg-[#07090f] p-3 md:p-5", className)}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-400/80">OmniMind OS</p>
          <h1 className="text-xl font-semibold text-zinc-100 md:text-2xl">Home Dashboard</h1>
          <p className="text-xs text-zinc-500">Your AI operating system — projects, agents, and platform health.</p>
        </div>
        <div className="flex gap-2">
          {onOpenHub ? (
            <button
              type="button"
              onClick={onOpenHub}
              className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-200 hover:bg-cyan-500/20"
            >
              Open Hub
            </button>
          ) : null}
          {onContinueChat ? (
            <button
              type="button"
              onClick={onContinueChat}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-200 hover:bg-white/[0.08]"
            >
              Continue in Chat
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid auto-rows-min gap-3 md:grid-cols-2 xl:grid-cols-3">
        <OSCard title="Continue Working" subtitle="Pick up where you left off" span={2}>
          {data.continueWorking ? (
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-3 text-left hover:bg-emerald-500/10"
              onClick={onContinueChat}
            >
              <div>
                <p className="text-sm font-medium text-zinc-100">{data.continueWorking.label}</p>
                <p className="text-[10px] text-zinc-500">{data.continueWorking.toolSlug}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-emerald-400" />
            </button>
          ) : (
            <p className="text-xs text-zinc-500">No active project — start from Quick Launch.</p>
          )}
        </OSCard>

        <OSCard title="System Health" subtitle={`Score ${data.systemHealth.score}`}>
          <div className="space-y-1">
            {data.systemHealth.checks.slice(0, 5).map((c) => (
              <div key={c.name} className="flex items-center justify-between text-[10px]">
                <span className="text-zinc-400">{c.name}</span>
                <span className={c.ok ? "text-emerald-400" : "text-amber-400"}>{c.ok ? "OK" : "Check"}</span>
              </div>
            ))}
          </div>
        </OSCard>

        <OSCard title="Pinned Projects" subtitle={`${data.pinnedProjects.length} pinned`}>
          <ul className="space-y-1">
            {data.pinnedProjects.slice(0, 5).map((p) => (
              <li key={p.id} className="flex items-center gap-2 text-xs text-zinc-300">
                <Pin className="h-3 w-3 text-cyan-400" />
                <span className="truncate">{p.name}</span>
              </li>
            ))}
          </ul>
        </OSCard>

        <OSCard title="Recent Projects" subtitle="Last opened">
          <ul className="space-y-1">
            {data.recentProjects.slice(0, 5).map((p) => (
              <li key={p.id} className="truncate text-xs text-zinc-400">
                {p.name}
              </li>
            ))}
          </ul>
        </OSCard>

        <OSCard title="AI Recommendations" subtitle="Unified Brain">
          <ul className="space-y-2">
            {data.recommendations.map((r) => (
              <li key={r.id} className="flex gap-2 text-[11px] text-zinc-300">
                <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-violet-400" />
                <span>{r.text}</span>
              </li>
            ))}
          </ul>
        </OSCard>

        <OSCard title="Recent Chats" subtitle={`${data.recentChats.length} sessions`}>
          <ul className="space-y-1">
            {data.recentChats.map((c) => (
              <li key={c.id} className="truncate text-xs text-zinc-400">
                {c.title}
              </li>
            ))}
          </ul>
        </OSCard>

        <OSCard title="AI Activity" subtitle="Gateway">
          <div className="flex items-center gap-3 text-xs">
            <Bot className="h-4 w-4 text-cyan-400" />
            <div>
              <p className="text-zinc-200">{data.aiActivity.requestCount} requests</p>
              <p className="text-zinc-500">p50 {data.aiActivity.latencyP50Ms}ms</p>
            </div>
          </div>
        </OSCard>

        <OSCard title="Running Tasks" subtitle="Agents & jobs">
          <p className="text-xs text-zinc-400">{data.runningTasks.length || data.backgroundJobs.length} active</p>
        </OSCard>

        <OSCard title="Quick Launch" subtitle="Tools" span={2}>
          <div className="flex flex-wrap gap-2">
            {data.quickLaunch.map((q) => (
              <Link
                key={q.id}
                href={q.href}
                className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-1 text-[10px] text-zinc-300 hover:border-cyan-500/30 hover:text-cyan-200"
              >
                {q.label}
              </Link>
            ))}
          </div>
        </OSCard>

        <OSCard title="Favorites">
          <ul className="space-y-1">
            {data.favorites.slice(0, 4).map((f) => (
              <li key={f.id} className="flex items-center gap-2 text-xs text-zinc-400">
                <Heart className="h-3 w-3 text-rose-400" />
                {f.label}
              </li>
            ))}
          </ul>
        </OSCard>

        <OSCard title="Recent Files">
          <ul className="space-y-1">
            {data.recentFiles.slice(0, 4).map((f) => (
              <li key={f.id} className="flex items-center gap-2 text-xs text-zinc-400">
                <FileText className="h-3 w-3" />
                <span className="truncate">{f.name}</span>
              </li>
            ))}
          </ul>
        </OSCard>

        <OSCard title="Calendar">
          <ul className="space-y-1">
            {data.calendar.map((e) => (
              <li key={e.id} className="flex items-center gap-2 text-xs text-zinc-400">
                <Calendar className="h-3 w-3" />
                {e.title}
              </li>
            ))}
          </ul>
        </OSCard>

        <OSCard title="Goals">
          <ul className="space-y-2">
            {data.goals.map((g) => (
              <li key={g.id}>
                <div className="mb-1 flex justify-between text-[10px] text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    {g.title}
                  </span>
                  <span>{g.progress}%</span>
                </div>
                <div className="h-1 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-cyan-500/70" style={{ width: `${g.progress}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </OSCard>

        <OSCard title="Notifications & Updates">
          <div className="space-y-2 text-xs text-zinc-400">
            <p className="flex items-center gap-2">
              <Activity className="h-3 w-3" />
              {data.notifications.filter((n) => !n.read).length} unread
            </p>
            {data.updates[0] ? (
              <p className="flex items-center gap-2">
                <Rocket className="h-3 w-3 text-cyan-400" />
                {data.updates[0].version} — {data.updates[0].title}
              </p>
            ) : null}
          </div>
        </OSCard>

        <OSCard title="Platform" subtitle="OmniMind Hub">
          <button
            type="button"
            onClick={onOpenHub}
            className="flex items-center gap-2 text-xs text-cyan-300 hover:underline"
          >
            <LayoutGrid className="h-4 w-4" />
            Switch tools — shared memory & assets
          </button>
        </OSCard>
      </div>
    </div>
  );
}
