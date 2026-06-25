"use client";

import { useEffect, useState } from "react";
import { Copy, Download, RefreshCw, X } from "lucide-react";
import { omniCore } from "../../../core/omnicore/OmniCore";
import type { AITaskRecord } from "../../../core/ecosystem/types";
import { cn } from "../../../lib/utils";

type Props = { open: boolean; onClose: () => void };

export function OmniMindAITaskCenter({ open, onClose }: Props) {
  const [tasks, setTasks] = useState<AITaskRecord[]>([]);
  const [filter, setFilter] = useState<"all" | "queued" | "running" | "completed">("all");

  useEffect(() => {
    if (!open) return;
    const load = () => void omniCore.ecosystem.aiTasks.list().then(setTasks);
    load();
    const id = window.setInterval(load, 4000);
    return () => window.clearInterval(id);
  }, [open]);

  if (!open) return null;

  const filtered = tasks.filter((t) => filter === "all" || t.status === filter);

  return (
    <div className="fixed inset-0 z-[200] flex justify-center bg-black/50 p-4 pt-16" onClick={onClose}>
      <div
        className="flex h-[min(80vh,640px)] w-full max-w-2xl flex-col rounded-xl border border-white/10 bg-[#0c1018]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h2 className="text-sm font-semibold text-zinc-100">AI Task Center</h2>
          <button type="button" onClick={onClose} className="text-zinc-500 hover:text-zinc-200">
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="flex gap-1 border-b border-white/5 px-3 py-2">
          {(["all", "queued", "running", "completed"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded px-2 py-1 text-[10px] capitalize",
                filter === f ? "bg-cyan-500/20 text-cyan-200" : "text-zinc-500 hover:text-zinc-300",
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <ul className="history-scroll-hover flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.map((t) => (
            <li key={t.id} className="flex items-center gap-2 rounded-lg border border-white/[0.05] px-3 py-2 text-xs">
              <div className="min-w-0 flex-1">
                <p className="truncate text-zinc-200">{t.label}</p>
                <p className="text-[9px] text-zinc-500">{t.status} · {t.progress}%</p>
              </div>
              <button
                type="button"
                title="Retry"
                onClick={() => omniCore.ecosystem.aiTasks.retry(t.id)}
                className="rounded p-1 text-zinc-500 hover:text-cyan-300"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                title="Duplicate"
                onClick={() => omniCore.ecosystem.aiTasks.duplicate(t.id)}
                className="rounded p-1 text-zinc-500 hover:text-cyan-300"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                title="Export"
                onClick={() => {
                  const json = omniCore.ecosystem.aiTasks.exportTask(t.id);
                  if (json) navigator.clipboard.writeText(json);
                }}
                className="rounded p-1 text-zinc-500 hover:text-cyan-300"
              >
                <Download className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
