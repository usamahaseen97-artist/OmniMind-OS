"use client";

import { Activity, Infinity, LogIn } from "lucide-react";

interface TopBarProps {
  moduleLabel: string;
  backendOnline: boolean;
}

export function TopBar({ moduleLabel, backendOnline }: TopBarProps) {
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-zinc-800/80 bg-[#0a0a0e]/80 px-6 py-4 backdrop-blur-sm">
      <div className="text-center flex-1">
        <p className="text-[10px] uppercase tracking-[0.35em] text-amber-500/70">
          Bismillah-ir-Rahman-ir-Rahim
        </p>
        <h1 className="mt-1 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-2xl font-bold tracking-[0.15em] text-transparent">
          OMNIMIND V11
        </h1>
        <p className="mt-0.5 text-[10px] text-zinc-500">
          FOUNDER: USAMA HASEEN · SOVEREIGN ALPHA CORE · {moduleLabel}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`mr-2 hidden items-center gap-1.5 rounded-full px-2 py-1 text-[10px] sm:flex ${
            backendOnline
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-red-500/10 text-red-400"
          }`}
        >
          <Activity className="h-3 w-3" />
          {backendOnline ? "KERNEL ONLINE" : "KERNEL OFFLINE"}
        </span>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-300 transition hover:border-zinc-500 hover:text-white"
        >
          <LogIn className="h-3.5 w-3.5" />
          Enter System
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-black shadow-lg shadow-amber-900/30 transition hover:from-amber-400 hover:to-amber-500"
        >
          <Infinity className="h-3.5 w-3.5" />
          GO INFINITE
        </button>
      </div>
    </header>
  );
}
