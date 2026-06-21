"use client";

import { Cpu, Database, HardDrive, Wifi } from "lucide-react";

interface SystemCapacityPanelProps {
  backendOnline: boolean;
  logicFrequency?: number;
  memoryUsed?: number;
}

export function SystemCapacityPanel({
  backendOnline,
  logicFrequency = 100,
  memoryUsed = 42,
}: SystemCapacityPanelProps) {
  const stats = [
    { label: "Neural Bridge", value: backendOnline ? "ONLINE" : "OFFLINE", icon: Wifi },
    { label: "Logic Frequency", value: `${logicFrequency.toFixed(1)}%`, icon: Cpu },
    { label: "Memory Vault", value: `${memoryUsed}%`, icon: Database },
    { label: "Core Load", value: "OPTIMAL", icon: HardDrive },
  ];

  return (
    <aside className="flex w-[260px] shrink-0 flex-col border-l border-neon-green/10 bg-[#060807]">
      <header className="border-b border-neon-green/10 px-4 py-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-neon-green">
          System Capacity
        </h2>
      </header>

      <div className="flex-1 space-y-3 p-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-neon-green/10 bg-[#0a0f0c] p-3"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500">{s.label}</span>
              <s.icon className="h-3.5 w-3.5 text-neon-green/60" />
            </div>
            <p
              className={`font-mono text-sm font-bold ${
                s.label === "Neural Bridge" && !backendOnline
                  ? "text-red-400"
                  : "text-neon-green"
              }`}
            >
              {s.value}
            </p>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-zinc-900">
              <div
                className="h-full rounded-full bg-gradient-to-r from-neon-green/40 to-neon-green transition-all"
                style={{ width: s.label === "Memory Vault" ? `${memoryUsed}%` : "88%" }}
              />
            </div>
          </div>
        ))}

        <div className="mt-6 rounded-xl border border-neon-green/15 p-4 text-center">
          <p className="text-[10px] uppercase text-zinc-600">Future State</p>
          <p className="mt-1 font-mono text-xs text-neon-green">SYNTHESIS READY</p>
        </div>
      </div>
    </aside>
  );
}
