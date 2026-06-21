"use client";

import { LineChart, TrendingUp } from "lucide-react";
import { useEffect } from "react";
import { useBusinessAnalyticsPipeline } from "../../../hooks/useBusinessAnalyticsPipeline";
import { deckChip, deckChipActive, deckRow } from "../../../lib/deck-interactive";
import {
  ensureAgentDeckRuntime,
  setAnalyticsArea,
  setAnalyticsMetric,
  useAgentLiveDeck,
} from "../../../lib/agent-live-deck-store";
import {
  METRIC_NODES,
  type KarachiMetricId,
} from "../../../lib/karachi-analytics-dataset";
import {
  runAnalyticsPipeline,
  setAnalyticsChartType,
  useAgentPipeline,
} from "../../../lib/agent-pipeline-store";
import { cn } from "../../../lib/utils";
import { DeckMicroLoader } from "../DeckMicroLoader";
import { DeckShell } from "../DeckShell";

const SEED_SERIES = [22, 38, 31, 55, 48, 62, 58, 71, 65, 78];

export function DeckAnalyticsPanel() {
  const { loading, error, result, chartType } = useAgentPipeline("analytics");
  const live = useAgentLiveDeck().analytics;

  useEffect(() => {
    ensureAgentDeckRuntime("business-analytics");
    void runAnalyticsPipeline(SEED_SERIES, "bar");
  }, []);

  useBusinessAnalyticsPipeline(true, SEED_SERIES);

  const series =
    chartType === "bar"
      ? result?.compute.bar_series ?? SEED_SERIES
      : result?.compute.chart_series ?? SEED_SERIES;

  const barPct =
    live.selectedMetric === "mutton"
      ? live.muttonSharePct
      : live.selectedMetric === "cow"
        ? live.cowSharePct
        : live.selectedMetric === "wastage"
          ? live.wastagePct
          : live.muttonSharePct;

  const computing = live.streaming || live.engineDegraded || loading;
  const flash = Date.now() - live.lastTokenAt < 600;

  return (
    <DeckShell
      title="Karachi Data Grid"
      subtitle="Stream-driven · Python compute deck"
    >
      <div className="flex items-center gap-2 rounded-lg border border-emerald-500/25 bg-[#0B0C10]/90 px-2 py-1.5">
        <span
          className={cn(
            "h-2 w-2 rounded-full bg-[#00FF87]",
            computing && "animate-pulse shadow-[0_0_8px_#00FF87]",
          )}
        />
        <span className="text-[9px] font-medium text-zinc-400">
          {computing ? "Live computing…" : "Runtime ready"}
        </span>
      </div>

      {(live.streaming || loading) && (
        <DeckMicroLoader label={`Parsing stream · row ${live.rowCounter}`} />
      )}

      <section className="space-y-1">
        <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-400/80">
          Metric nodes
        </p>
        <div className="grid grid-cols-2 gap-1">
          {METRIC_NODES.map((node) => (
            <button
              key={node.id}
              type="button"
              onClick={() => setAnalyticsMetric(node.id as KarachiMetricId)}
              className={cn(
                deckChip,
                "pointer-events-auto px-2 py-1.5 text-left text-[9px] font-medium",
                live.selectedMetric === node.id && deckChipActive,
                flash && live.selectedMetric === node.id && "animate-pulse",
              )}
            >
              {node.label}
            </button>
          ))}
        </div>
      </section>

      <button
        type="button"
        onClick={() => setAnalyticsMetric("total_sales")}
        className={cn(deckRow, "pointer-events-auto", flash && "border-emerald-500/60")}
      >
        <span className="text-[10px] text-zinc-400">Total Sales (PKR lakhs)</span>
        <span className="text-sm font-bold tabular-nums text-[#00FF87]">
          {live.totalSalesLakhs.toFixed(1)}
        </span>
      </button>

      <div
        className={cn(
          "pointer-events-auto rounded-lg border border-emerald-500/25 bg-[#0B0C10] p-2",
          flash && "border-emerald-500/60",
        )}
      >
        <div className="mb-1 flex justify-between text-[9px] text-zinc-500">
          <span>Share bar · {live.selectedMetric.replace("_", " ")}</span>
          <span className="font-mono text-[#00FF87]">{barPct.toFixed(1)}%</span>
        </div>
        <svg viewBox="0 0 100 10" className="h-2.5 w-full" aria-hidden>
          <rect width="100" height="10" rx="2" fill="#15171E" />
          <rect
            width={barPct}
            height="10"
            rx="2"
            fill="#00FF87"
            className="transition-all duration-300 ease-out"
          />
        </svg>
      </div>

      <section className="space-y-1">
        <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-400/80">
          Regional sales tabs
        </p>
        {live.areas.map((area) => {
          const active = live.selectedAreaId === area.id;
          return (
            <button
              key={area.id}
              type="button"
              onClick={() => setAnalyticsArea(area.id)}
              className={cn(
                deckRow,
                "pointer-events-auto py-1.5",
                active && "border-emerald-500/60 bg-emerald-500/10",
                computing && active && "animate-pulse",
              )}
            >
              <span className="flex items-center gap-1.5 text-[10px] text-zinc-300">
                {active ? (
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00FF87]" />
                ) : null}
                {area.name}
              </span>
              <span className="flex items-center gap-2">
                <span className="text-[9px] text-zinc-500">{area.salesLakhs}L</span>
                <span className="text-xs font-bold text-cyan-300">{area.sharePct}%</span>
              </span>
            </button>
          );
        })}
      </section>

      <button
        type="button"
        onClick={() => setAnalyticsMetric("wastage")}
        className={cn(deckRow, "pointer-events-auto")}
      >
        <span className="text-[10px] text-zinc-400">Wastage tracker</span>
        <span
          className={cn(
            "text-sm font-bold text-amber-400",
            computing && "animate-pulse",
          )}
        >
          {live.wastagePct}%
        </span>
      </button>

      <div className="flex gap-1">
        {(["line", "bar"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setAnalyticsChartType(t);
              void runAnalyticsPipeline(SEED_SERIES, t);
            }}
            className={cn(
              deckChip,
              "pointer-events-auto flex-1 py-1 text-[9px] uppercase",
              chartType === t && deckChipActive,
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {error ? (
        <p className="text-xs text-amber-400/90">
          API compute paused — client charts active ({error})
        </p>
      ) : (
        <div className={cn(deckChip, "pointer-events-auto min-h-[100px] p-2")}>
          <div className="mb-1 flex items-center gap-1 text-[9px] text-zinc-600">
            <LineChart className="h-3 w-3 text-[#10B981]" />
            {result?.compute.module ?? "omnimind_analytics_py"}
          </div>
          <div className="flex h-20 items-end justify-between gap-0.5">
            {series.map((v, i) => (
              <div
                key={i}
                className="w-full max-w-[12px] rounded-t bg-gradient-to-t from-[#10B981]/80 to-[#10B981]/20 transition-all duration-300"
                style={{ height: `${Math.min(100, v)}%` }}
              />
            ))}
          </div>
          {result ? (
            <p className="mt-1 flex items-center gap-1 text-[9px] text-zinc-600">
              <TrendingUp className="h-3 w-3" />
              Growth {result.compute.growth_rate_pct}% · MA {result.compute.moving_average}
            </p>
          ) : null}
        </div>
      )}
    </DeckShell>
  );
}
