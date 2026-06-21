"use client";

import { Activity, BarChart3, Box, Radio, Video } from "lucide-react";

interface RightPanelProps {
  wealthStatus: string;
  logicFrequency: number;
}

const TABS = [
  { id: "logic", label: "Live Logic", icon: Radio },
  { id: "video", label: "Video Canvas", icon: Video },
  { id: "forge", label: "3D Forge", icon: Box },
] as const;

export function RightPanel({ wealthStatus, logicFrequency }: RightPanelProps) {
  return (
    <aside className="flex w-[280px] shrink-0 flex-col border-l border-zinc-800/80 bg-[#0a0a0e]">
      <div className="flex border-b border-zinc-800/80">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className="flex flex-1 flex-col items-center gap-1 py-3 text-[9px] uppercase tracking-wider text-zinc-500 transition first:text-amber-400 hover:text-zinc-300"
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex gap-2">
          <button
            type="button"
            className="flex-1 rounded-lg border border-amber-500/30 bg-amber-500/10 py-2 text-[10px] font-semibold text-amber-300"
          >
            LIVE TEST
          </button>
          <button
            type="button"
            className="flex-1 rounded-lg border border-zinc-700 py-2 text-[10px] text-zinc-400 hover:border-zinc-500"
          >
            ANALYTICS
          </button>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 text-center">
          <div className="relative mb-4 flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 animate-pulse rounded-full border border-amber-500/20" />
            <div className="absolute inset-2 rounded-full border border-amber-500/10" />
            <Activity className="relative h-8 w-8 text-amber-500/80" />
          </div>
          <p className="text-xs font-semibold text-zinc-400">FUTURE STATE: NULL</p>
          <p className="mt-2 text-[10px] text-zinc-600">Awaiting Neural Logic Synthesis</p>
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-950/40 to-transparent p-4">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500">
            Future Prediction Pulse
          </p>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-zinc-500">Wealth Status</p>
              <p className="text-lg font-bold text-amber-400">{wealthStatus}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-amber-500/40" />
          </div>
        </div>
      </div>

      <footer className="border-t border-zinc-800/80 p-3 text-[10px] text-zinc-600">
        <p>Logic Frequency: {logicFrequency.toFixed(2)}%</p>
        <p className="mt-1 text-emerald-500/80">Status: Free Domain Active</p>
        <p className="mt-2 text-zinc-700">Engineered by Usama Haseen</p>
      </footer>
    </aside>
  );
}
