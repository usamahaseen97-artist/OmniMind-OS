"use client";

import { useEffect, useState } from "react";
import { Cpu, HardDrive, MemoryStick, Network, X } from "lucide-react";
import { omniCore } from "../../../core/omnicore/OmniCore";
import type { SystemResourceSnapshot } from "../../../core/ecosystem/types";

type Props = { open: boolean; onClose: () => void };

export function OmniMindSystemTaskManager({ open, onClose }: Props) {
  const [sys, setSys] = useState<SystemResourceSnapshot | null>(null);

  useEffect(() => {
    if (!open) return;
    void omniCore.ecosystem.systemTasks.refresh().then(setSys);
    const id = window.setInterval(() => void omniCore.ecosystem.systemTasks.refresh().then(setSys), 5000);
    return () => window.clearInterval(id);
  }, [open]);

  if (!open) return null;

  const rows = [
    { icon: Cpu, label: "CPU", value: sys?.cpuPercent != null ? `${sys.cpuPercent}%` : "—" },
    { icon: MemoryStick, label: "RAM", value: sys?.ramUsedMb != null ? `${sys.ramUsedMb} / ${sys.ramTotalMb ?? "?"} MB` : "—" },
    { icon: HardDrive, label: "Storage", value: sys?.storageUsedGb != null ? `${sys.storageUsedGb} / ${sys.storageTotalGb} GB` : "—" },
    { icon: Network, label: "AI tokens", value: String(sys?.aiTokensToday ?? 0) },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-xl border border-white/10 bg-[#0c1018] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h2 className="text-sm font-semibold text-zinc-100">Task Manager</h2>
          <button type="button" onClick={onClose} className="text-zinc-500 hover:text-zinc-200">
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="grid grid-cols-2 gap-3 p-4">
          {rows.map((r) => (
            <div key={r.label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <r.icon className="mb-2 h-4 w-4 text-cyan-400" />
              <p className="text-[10px] uppercase text-zinc-500">{r.label}</p>
              <p className="text-sm text-zinc-200">{r.value}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 px-4 py-3 text-[10px] text-zinc-500">
          Workers {sys?.workers ?? 0} · Render queue {sys?.renderQueue ?? 0} · Video {sys?.videoQueue ?? 0} · Audio{" "}
          {sys?.audioQueue ?? 0} · Uptime {sys?.uptimeSeconds ?? 0}s
        </div>
      </div>
    </div>
  );
}
