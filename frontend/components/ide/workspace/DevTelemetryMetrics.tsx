"use client";

import { Activity, Cpu, Wifi } from "lucide-react";
import { useEffect, useState } from "react";

type Spark = { values: number[] };

function Sparkline({ values }: Spark) {
  const max = Math.max(...values, 1);
  const w = 48;
  const h = 14;
  const pts = values
    .map((v, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * w;
      const y = h - (v / max) * h;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} className="shrink-0 opacity-80" aria-hidden>
      <polyline
        fill="none"
        stroke="var(--omni-amber)"
        strokeWidth="1.2"
        points={pts}
        style={{ filter: "drop-shadow(0 0 4px var(--omni-amber-glow))" }}
      />
    </svg>
  );
}

/** Compact telemetry strip — neon metric nodes above terminal */
export function DevTelemetryMetrics({ active }: { active: boolean }) {
  const [latency, setLatency] = useState([42, 38, 55, 48, 36, 44, 39]);
  const [compilePct, setCompilePct] = useState(100);

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => {
      setLatency((prev) => [...prev.slice(1), 30 + Math.round(Math.random() * 40)]);
      setCompilePct((p) => (p >= 100 ? 72 + Math.round(Math.random() * 28) : Math.min(100, p + 8)));
    }, 2400);
    return () => window.clearInterval(id);
  }, [active]);

  return (
    <div className="flex shrink-0 items-center gap-2 border-b px-2 py-1.5 omni-dev-panel-header">
      <div className="omni-dev-metric-node flex items-center gap-1.5 rounded-md border px-2 py-1">
        <Wifi className="h-3 w-3" style={{ color: "var(--omni-emerald)" }} />
        <span className="font-mono text-[9px] tracking-tight" style={{ color: "var(--omni-emerald)" }}>
          API 8001
        </span>
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--omni-emerald)] shadow-[0_0_6px_var(--omni-emerald-glow)]" />
      </div>
      <div className="omni-dev-metric-node flex items-center gap-1.5 rounded-md border px-2 py-1">
        <Activity className="h-3 w-3" style={{ color: "var(--omni-amber)" }} />
        <span className="font-mono text-[9px] tracking-tight" style={{ color: "var(--omni-text-muted)" }}>
          pipeline
        </span>
        <Sparkline values={latency} />
      </div>
      <div className="omni-dev-metric-node ml-auto flex items-center gap-1.5 rounded-md border px-2 py-1">
        <Cpu className="h-3 w-3" style={{ color: "var(--omni-text-muted)" }} />
        <span className="font-mono text-[9px] tracking-tight" style={{ color: "var(--omni-text-muted)" }}>
          compile {compilePct}%
        </span>
      </div>
    </div>
  );
}
