"use client";

import { TrendingUp } from "lucide-react";
import { cn } from "../../lib/utils";

const METRICS = [
  { label: "Alpha Signal", value: "+12.4%", tone: "text-[#00FF87]" },
  { label: "Volatility", value: "18.2", tone: "text-amber-400" },
  { label: "Sharpe", value: "2.31", tone: "text-cyan-400" },
  { label: "Drawdown", value: "-3.1%", tone: "text-zinc-400" },
];

export function DeckChartsMock() {
  const bars = [42, 68, 55, 82, 61, 74, 88, 52, 70, 90, 48, 65];

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 p-3">
      <div className="grid grid-cols-2 gap-2">
        {METRICS.map((m) => (
          <div
            key={m.label}
            className="rounded-lg border border-gray-800/60 bg-[#0B0C10]/80 p-2 shadow-[0_0_12px_rgba(16,185,129,0.06)]"
          >
            <p className="text-[9px] uppercase tracking-wider text-zinc-600">{m.label}</p>
            <p className={cn("text-lg font-bold", m.tone)}>{m.value}</p>
          </div>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-emerald-500/20 bg-[#0B0C10] p-3">
        <div className="mb-2 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[#10B981]" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Live metrics grid
          </span>
        </div>
        <div className="flex flex-1 items-end justify-between gap-1">
          {bars.map((h, i) => (
            <div
              key={i}
              className="w-full max-w-[18px] rounded-t bg-gradient-to-t from-[#10B981]/80 to-[#10B981]/20 shadow-[0_0_8px_rgba(16,185,129,0.25)]"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
