"use client";

import { BarChart3, PieChart, Table2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { ClientMountGate } from "../../client/ClientMountGate";
import { runClientAnime } from "../../../../lib/client-anime";
import { useWorkbenchLive } from "../../../../lib/workbench-live-store";
import { GlassScrollViewport } from "../../workspace/GlassScrollViewport";

const DEFAULT_HEIGHTS = [30, 55, 40, 75, 50, 85, 45, 65, 70];
const PIE_SEGMENTS = [35, 25, 20, 20];

function AnalyticsDashboard() {
  const live = useWorkbenchLive();
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const pieRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const heights = live.chartSeries.length >= 5 ? live.chartSeries : DEFAULT_HEIGHTS;

  useEffect(() => {
    const bars = barsRef.current.filter(Boolean) as HTMLDivElement[];
    bars.forEach((bar, i) => {
      void runClientAnime(bar, {
        height: ["0%", `${heights[i] ?? 40}%`],
        opacity: [0.3, 1],
        duration: 900,
        delay: i * 60,
        ease: "outExpo",
      });
    });

    if (pieRef.current) {
      void runClientAnime(pieRef.current, {
        scale: [0.6, 1],
        opacity: [0, 1],
        duration: 800,
        ease: "outElastic(1, .6)",
      });
    }

    if (tableRef.current) {
      const rows = tableRef.current.querySelectorAll("tbody tr");
      rows.forEach((row, i) => {
        void runClientAnime(row, {
          translateX: [-12, 0],
          opacity: [0, 1],
          duration: 500,
          delay: i * 80,
          ease: "outQuad",
        });
      });
    }
  }, [heights.join(","), live.streaming]);

  const metrics = live.metrics.length
    ? live.metrics
    : [
        { label: "Revenue", value: "$842K", ok: true },
        { label: "Orders", value: "12.4K", ok: true },
        { label: "Wastage", value: "2.1%", ok: false },
        { label: "Margin", value: "18.7%", ok: true },
      ];

  return (
    <div className="h-full" style={{ background: "#0B0F19" }}>
      <GlassScrollViewport showControls className="h-full">
      <div className="flex min-h-0 flex-col gap-3 p-4">
        <div className="flex shrink-0 items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 omni-accent-text" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Streaming Analytics Core</span>
          </div>
          {live.streaming ? <span className="animate-pulse text-[9px] omni-accent-text omni-state-ring rounded-full px-2 py-0.5">Processing records…</span> : null}
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-2 md:grid-cols-4">
          {metrics.slice(0, 4).map((m) => (
            <div
              key={m.label}
              className="omni-state-ring rounded-xl border px-3 py-2"
              style={{ borderColor: "#1E293B", background: "var(--omni-panel)" }}
            >
              <p className="text-[8px] uppercase" style={{ color: "var(--omni-text-muted)" }}>
                {m.label}
              </p>
              <p className={`text-sm font-bold ${m.ok ? "omni-accent-text" : "text-amber-400"}`}>{m.value}</p>
            </div>
          ))}
        </div>

        <div className="grid min-h-[200px] flex-1 grid-cols-1 gap-3 lg:grid-cols-[1fr_180px]">
          <div
            className="flex min-h-[180px] flex-col rounded-xl border p-3 omni-state-ring"
            style={{ borderColor: "#1E293B", background: "var(--omni-panel)" }}
          >
            <p className="mb-2 flex items-center gap-1 text-[9px] font-bold omni-accent-text">
              <BarChart3 className="h-3 w-3" /> Trend Matrix
            </p>
            <div className="grid min-h-0 flex-1 grid-cols-6 gap-1.5">
              {heights.slice(0, 12).map((h, i) => (
                <div key={i} className="flex min-h-0 flex-col justify-end">
                  <div
                    ref={(el) => {
                      barsRef.current[i] = el;
                    }}
                    className="w-full rounded-t"
                    style={{
                      height: `${h}%`,
                      background: "linear-gradient(to top, color-mix(in srgb, var(--omni-accent) 40%, black), var(--omni-accent))",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div
            className="flex flex-col items-center justify-center rounded-xl border p-3 omni-state-ring"
            style={{ borderColor: "#1E293B", background: "var(--omni-panel)" }}
          >
            <p className="mb-2 flex items-center gap-1 self-start text-[9px] font-bold omni-accent-text">
              <PieChart className="h-3 w-3" /> Mix
            </p>
            <div
              ref={pieRef}
              className="h-24 w-24 rounded-full"
              style={{
                background: `conic-gradient(var(--omni-accent) 0% ${PIE_SEGMENTS[0]}%, #334155 ${PIE_SEGMENTS[0]}% ${PIE_SEGMENTS[0] + PIE_SEGMENTS[1]}%, #475569 ${PIE_SEGMENTS[0] + PIE_SEGMENTS[1]}% 100%)`,
              }}
            />
          </div>
        </div>

        <div
          className="shrink-0 overflow-hidden rounded-xl border omni-state-ring"
          style={{ borderColor: "#1E293B", background: "var(--omni-panel)" }}
        >
          <p className="flex items-center gap-1 border-b px-3 py-2 text-[9px] font-bold omni-accent-text" style={{ borderColor: "#1E293B" }}>
            <Table2 className="h-3 w-3" /> Insight Table · Live Grid
          </p>
          <table ref={tableRef} className="w-full text-[9px]">
            <thead style={{ color: "var(--omni-text-muted)" }}>
              <tr className="border-b" style={{ borderColor: "#1E293B" }}>
                <th className="px-3 py-1.5 text-left">Segment</th>
                <th className="px-3 py-1.5 text-right">Volume</th>
                <th className="px-3 py-1.5 text-right">Δ</th>
              </tr>
            </thead>
            <tbody>
              {(live.chartLabels.length ? live.chartLabels : ["North", "South", "East", "West"]).slice(0, 6).map((label, i) => (
                <tr key={label} className="border-b" style={{ borderColor: "#1E293B" }}>
                  <td className="px-3 py-1.5">{label}</td>
                  <td className="px-3 py-1.5 text-right omni-accent-text">{(heights[i] ?? 40) * 120}</td>
                  <td className="px-3 py-1.5 text-right">{i % 2 === 0 ? "+4.2%" : "-1.1%"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </GlassScrollViewport>
    </div>
  );
}

export function ToolLiveSimAnalytics() {
  return (
    <ClientMountGate label="analytics charts">
      <AnalyticsDashboard />
    </ClientMountGate>
  );
}
