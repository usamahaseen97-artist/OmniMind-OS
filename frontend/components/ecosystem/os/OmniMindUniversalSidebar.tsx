"use client";

import Link from "next/link";
import {
  Bell,
  Cloud,
  Download,
  LayoutGrid,
  ListTodo,
  PanelLeft,
  Pin,
  Plug,
  Upload,
} from "lucide-react";
import { omniCore } from "../../../core/omnicore/OmniCore";
import { useEcosystemOS } from "../../../lib/ecosystem-os-context";
import { cn } from "../../../lib/utils";

export function OmniMindUniversalSidebar() {
  const { sidebarCollapsed, toggleSidebar, openPanel } = useEcosystemOS();
  const pins = omniCore.ecosystem.sidebar.pinned();
  const recent = omniCore.ecosystem.sidebar.recent();

  if (sidebarCollapsed) {
    return (
      <aside className="fixed left-0 top-1/2 z-[150] flex -translate-y-1/2 flex-col gap-1 rounded-r-lg border border-white/10 bg-[#0a0d14]/95 p-1 shadow-lg">
        <button
          type="button"
          onClick={toggleSidebar}
          className="rounded p-2 text-zinc-500 hover:bg-white/5 hover:text-cyan-300"
          aria-label="Expand sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => openPanel("hub")} className="rounded p-2 text-zinc-500 hover:text-cyan-300">
          <LayoutGrid className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => openPanel("activity")} className="rounded p-2 text-zinc-500 hover:text-violet-300">
          <Bell className="h-4 w-4" />
        </button>
      </aside>
    );
  }

  return (
    <aside className="fixed left-0 top-14 z-[140] flex h-[calc(100vh-3.5rem)] w-52 flex-col border-r border-white/10 bg-[#0a0d14]/95 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-400/80">OmniMind</span>
        <button type="button" onClick={toggleSidebar} className="text-zinc-500 hover:text-zinc-300">
          <PanelLeft className="h-3.5 w-3.5" />
        </button>
      </div>
      <nav className="history-scroll-hover flex-1 overflow-y-auto p-2 text-xs">
        <p className="mb-1 px-2 text-[9px] uppercase text-zinc-600">Pinned</p>
        {pins.map((p) => (
          <Link key={p.id} href={p.href} className="flex items-center gap-2 rounded px-2 py-1.5 text-zinc-300 hover:bg-white/5">
            <Pin className="h-3 w-3 text-cyan-400" />
            {p.label}
          </Link>
        ))}
        <p className="mb-1 mt-3 px-2 text-[9px] uppercase text-zinc-600">Recent</p>
        {recent.slice(0, 6).map((r) => (
          <div key={r.id} className="truncate px-2 py-1 text-zinc-500">
            {r.label}
          </div>
        ))}
        <p className="mb-1 mt-3 px-2 text-[9px] uppercase text-zinc-600">System</p>
        <button type="button" onClick={() => openPanel("tasks")} className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-zinc-400 hover:bg-white/5">
          <ListTodo className="h-3 w-3" /> Task Manager
        </button>
        <button type="button" onClick={() => openPanel("ai-tasks")} className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-zinc-400 hover:bg-white/5">
          <Cloud className="h-3 w-3" /> AI Tasks
        </button>
        <button type="button" onClick={() => openPanel("activity")} className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-zinc-400 hover:bg-white/5">
          <Bell className="h-3 w-3" /> Notifications
        </button>
        <button type="button" onClick={() => openPanel("hub")} className={cn("flex w-full items-center gap-2 rounded px-2 py-1.5 text-zinc-400 hover:bg-white/5")}>
          <LayoutGrid className="h-3 w-3" /> Hub
        </button>
        <div className="flex items-center gap-2 px-2 py-1.5 text-zinc-600">
          <Download className="h-3 w-3" /> Downloads
        </div>
        <div className="flex items-center gap-2 px-2 py-1.5 text-zinc-600">
          <Upload className="h-3 w-3" /> Uploads
        </div>
        <div className="flex items-center gap-2 px-2 py-1.5 text-zinc-600">
          <Plug className="h-3 w-3" /> Plugins
        </div>
      </nav>
    </aside>
  );
}
