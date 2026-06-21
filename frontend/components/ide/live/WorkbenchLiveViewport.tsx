"use client";

import { Loader2, Radio } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { ExecutionWorkspacePanel } from "../../layout/ExecutionWorkspacePanel";
import { LiveRenderWorkspace } from "../../layout/LiveRenderWorkspace";
import { useIDEOptional } from "../IDEProvider";
import { useAgentLiveDeck } from "../../../lib/agent-live-deck-store";
import { useAgentPipeline } from "../../../lib/agent-pipeline-store";
import {
  setWorkbenchContext,
  useWorkbenchLive,
} from "../../../lib/workbench-live-store";
import { cn } from "../../../lib/utils";

function StreamingOverlay({
  status,
  progress,
  phase,
  log,
}: {
  status: string | null;
  progress: number;
  phase: string | null;
  log: string[];
}) {
  return (
    <div
      className="absolute inset-x-0 top-0 z-20 border-b px-3 py-2 backdrop-blur-md"
      style={{
        borderColor: "var(--omni-border)",
        background: "color-mix(in srgb, var(--omni-panel) 88%, black)",
      }}
    >
      <div className="flex items-center gap-2">
        <Loader2 className="h-3.5 w-3.5 animate-spin omni-accent-text" />
        <span className="text-[10px] font-medium omni-accent-text">
          {status ?? "Live build in progress…"}
        </span>
        {phase ? (
          <span className="text-[9px]" style={{ color: "var(--omni-text-muted)" }}>
            · {phase}
          </span>
        ) : null}
      </div>
      {progress > 0 && progress < 100 ? (
        <div
          className="mt-2 h-1 overflow-hidden rounded-full"
          style={{ background: "var(--omni-border)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-300 omni-accent-bg"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      ) : null}
      {log.length > 0 ? (
        <pre
          className="mt-2 max-h-16 overflow-y-auto font-mono text-[9px] leading-relaxed omni-accent-text"
          style={{ color: "var(--omni-text-muted)" }}
        >
          {log.slice(-4).join("\n")}
        </pre>
      ) : null}
    </div>
  );
}

function AnalyticsLiveBars({
  series,
  labels,
  streaming,
}: {
  series: number[];
  labels: string[];
  streaming: boolean;
}) {
  const live = useAgentLiveDeck().analytics;
  const pipeline = useAgentPipeline("analytics");
  const data =
    pipeline.result?.compute.bar_series ??
    (series.length >= 3 ? series : [30, 55, 40, 75, 50, 85, 45, 65, 70]);
  const max = Math.max(...data, 1);

  return (
    <div className="flex h-full flex-col p-4" style={{ background: "var(--omni-bg)" }}>
      <div className="mb-3 flex items-center gap-2">
        <Radio className={cn("h-4 w-4 omni-accent-text", streaming && "animate-pulse")} />
        <span className="text-[11px] font-bold">Live Analytics · Power BI Preview</span>
      </div>
      <div
        className="flex flex-1 items-end gap-1 rounded-xl border p-4"
        style={{ borderColor: "var(--omni-border)", background: "var(--omni-panel)" }}
      >
        {data.map((v, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-t transition-all duration-500"
              style={{
                height: `${(v / max) * 100}%`,
                minHeight: 8,
                background:
                  "linear-gradient(to top, color-mix(in srgb, var(--omni-accent) 50%, black), var(--omni-accent))",
                opacity: streaming ? 0.85 + (i % 3) * 0.05 : 1,
              }}
            />
            <span className="text-[7px]" style={{ color: "var(--omni-text-muted)" }}>
              {labels[i] ?? live.areas[i]?.name?.slice(0, 4) ?? `M${i + 1}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MedicalLivePanel({
  metrics,
  streaming,
}: {
  metrics: { label: string; value: string; ok: boolean }[];
  streaming: boolean;
}) {
  const live = useAgentLiveDeck().medical;
  const board = metrics.length
    ? metrics
    : live.indicators.length
      ? live.indicators.map((ind) => ({
          label: ind.label.slice(0, 12),
          value: ind.severity,
          ok: ind.severity === "low",
        }))
      : [
          { label: "WBC", value: "7.2 K/µL", ok: true },
          { label: "Glucose", value: "118 mg/dL", ok: false },
        ];

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4" style={{ background: "var(--omni-bg)" }}>
      <div className="mb-4 flex items-center justify-center">
        <div
          className={cn(
            "relative flex h-32 w-32 items-center justify-center rounded-full border-2",
            streaming && "animate-pulse",
          )}
          style={{ borderColor: "var(--omni-border)", boxShadow: "0 0 40px var(--omni-accent-glow)" }}
        >
          <span className="text-[10px] omni-accent-text">Live Scan</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {board.map((m) => (
          <div
            key={m.label}
            className="rounded-lg border p-3"
            style={{ borderColor: m.ok ? "var(--omni-border)" : "rgba(234,179,8,0.4)" }}
          >
            <p className="text-[9px] uppercase" style={{ color: "var(--omni-text-muted)" }}>
              {m.label}
            </p>
            <p className="text-sm font-bold">{m.value}</p>
          </div>
        ))}
      </div>
      {live.indicators.length > 0 ? (
        <section className="mt-3 rounded-lg border p-3" style={{ borderColor: "rgba(239,68,68,0.35)" }}>
          {live.indicators.map((ind) => (
            <p key={ind.id} className="text-[10px] text-amber-300">
              {ind.label}
            </p>
          ))}
        </section>
      ) : null}
    </div>
  );
}

function VideoScenesGrid({
  scenes,
  videoUrl,
  streaming,
}: {
  scenes: { id: string; label: string; progress: number; thumbnail?: string }[];
  videoUrl?: string;
  streaming: boolean;
}) {
  type SceneTile = { id: string; label: string; progress: number; thumbnail?: string };

  if (videoUrl) {
    return (
      <div className="h-full p-2">
        <ExecutionWorkspacePanel
          preview={{ type: "video", label: "Creative render", video_url: videoUrl, active_tab: "live" }}
          embedded
          deckMode
        />
      </div>
    );
  }

  return (
    <div className="grid h-full grid-cols-5 gap-2 p-3" style={{ background: "var(--omni-bg)" }}>
      {(
        scenes.length
          ? scenes
          : Array.from({ length: 5 }, (_, i): SceneTile => ({
              id: `s${i}`,
              label: `Scene ${i + 1}`,
              progress: streaming ? 20 + i * 10 : 0,
            }))
      ).map((s) => (
        <div
          key={s.id}
          className="flex flex-col items-center justify-center rounded-lg border p-2"
          style={{ borderColor: "var(--omni-border)", background: "var(--omni-panel)" }}
        >
          {s.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.thumbnail} alt="" className="mb-1 h-12 w-full rounded object-cover" />
          ) : (
            <div
              className="mb-2 h-1.5 w-full overflow-hidden rounded-full"
              style={{ background: "var(--omni-border)" }}
            >
              <div
                className="h-full rounded-full omni-accent-bg transition-all"
                style={{ width: `${s.progress}%` }}
              />
            </div>
          )}
          <span className="text-[8px] omni-accent-text">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

export function WorkbenchLiveViewport({
  routeId,
  mode = "auto",
  fallback,
}: {
  routeId: string;
  mode?: "auto" | "analytics" | "medical" | "video" | "preview";
  fallback?: React.ReactNode;
}) {
  const live = useWorkbenchLive();

  const showLive =
    live.routeId === routeId &&
    (live.active || live.streaming || live.preview || live.renderSession);

  if (!showLive) return <>{fallback}</>;

  const hasPreview = Boolean(
    live.preview?.html ||
      live.preview?.image_url ||
      live.preview?.video_url ||
      live.preview?.svg ||
      live.preview?.files?.length ||
      live.preview?.images?.length,
  );

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
      {live.streaming ? (
        <StreamingOverlay
          status={live.statusText}
          progress={live.videoProgress || (live.streaming ? 42 : 0)}
          phase={live.videoPhase}
          log={live.terminalLog}
        />
      ) : null}

      <div className={cn("min-h-0 flex-1", live.streaming && "pt-[72px]")}>
        {live.renderSession ? (
          <LiveRenderWorkspace session={live.renderSession} className="h-full" />
        ) : mode === "analytics" || (mode === "auto" && routeId === "business-analytics") ? (
          <AnalyticsLiveBars
            series={live.chartSeries}
            labels={live.chartLabels}
            streaming={live.streaming}
          />
        ) : mode === "medical" || (mode === "auto" && routeId === "medical-diagnostic") ? (
          <MedicalLivePanel metrics={live.metrics} streaming={live.streaming} />
        ) : mode === "video" ||
          (mode === "auto" &&
            (routeId === "creative-visionary" || routeId === "vfx-master")) ? (
          <VideoScenesGrid
            scenes={live.scenes}
            videoUrl={live.preview?.video_url}
            streaming={live.streaming}
          />
        ) : hasPreview ? (
          <ExecutionWorkspacePanel preview={live.preview} embedded deckMode />
        ) : live.streamText ? (
          <pre
            className="h-full overflow-auto p-4 font-mono text-[11px] leading-relaxed omni-accent-text"
            style={{ background: "var(--omni-bg)" }}
          >
            {live.streamText}
          </pre>
        ) : (
          fallback
        )}
      </div>
    </div>
  );
}

export function WorkbenchLiveBinder({
  toolSlug,
  routeId,
  children,
}: {
  toolSlug: string;
  routeId: string;
  children: ReactNode;
}) {
  const live = useWorkbenchLive();
  const ide = useIDEOptional();

  useEffect(() => {
    setWorkbenchContext(toolSlug, routeId);
  }, [toolSlug, routeId]);

  useEffect(() => {
    const files = live.preview?.files;
    if (!files?.length || !ide) return;
    ide.mergeGenerated(files);
    ide.appendTerminal(`✓ Chat generated ${files.length} file(s) — live preview updated`);
    ide.patchWorkspaceState({ status: "Live build from chat", loading: false });
  }, [live.preview?.files, ide]);

  const routeMatch = !live.routeId || live.routeId === routeId;
  const hasLive =
    routeMatch &&
    (live.streaming ||
      live.preview ||
      live.renderSession ||
      live.streamText.length > 20 ||
      live.chartSeries.length >= 3 ||
      live.metrics.length > 0 ||
      live.scenes.some((s) => s.progress > 0));

  if (hasLive) {
    return (
      <WorkbenchLiveViewport
        routeId={routeId}
        fallback={children}
      />
    );
  }

  return <>{children}</>;
}
