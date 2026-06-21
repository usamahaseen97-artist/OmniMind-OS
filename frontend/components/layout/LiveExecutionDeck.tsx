"use client";

import { Monitor } from "lucide-react";
import type { AgentArchitectureOption } from "../../lib/agent-architecture-options";
import { CreativeVideoDurationPanel } from "../creative/CreativeVideoDurationPanel";
import { resolveAgentDeckSlot } from "../../lib/agent-deck-slot";
import { isAgentDrivenDeckRoute } from "../../lib/agent-driven-deck";
import type { CreativeVideoDurationSec } from "../../lib/creative-video-profiles";
import { isCreativeVideoRoute } from "../../lib/tool-routes";
import { useAgentLiveDeck } from "../../lib/agent-live-deck-store";
import type { ExecutionPreviewState } from "../../lib/execution-preview";
import type { LiveRenderSession } from "../../lib/live-render-pipeline";
import { cn } from "../../lib/utils";
import { AgentDeckViewport } from "../deck/AgentDeckViewport";
import { ExecutionWorkspacePanel } from "./ExecutionWorkspacePanel";
import { LiveRenderWorkspace } from "./LiveRenderWorkspace";

interface LiveExecutionDeckProps {
  activeAgent: AgentArchitectureOption;
  /** Mirrors left-sidebar selection — drives Phase 2 deck mocks */
  activeAgentSlot?: string;
  preview: ExecutionPreviewState | null;
  renderSession: LiveRenderSession | null;
  onRenderClose?: () => void;
  onRenderComplete?: () => void;
  creativeVideoDuration?: CreativeVideoDurationSec;
  onCreativeVideoDurationChange?: (sec: CreativeVideoDurationSec) => void;
  creativeVideoPipelineActive?: boolean;
  creativeVideoPipelineProgress?: number;
  creativeVideoSourceFileName?: string | null;
  creativeVideoSourcePreviewUrl?: string | null;
  creativeVideoPipelinePhaseLabel?: string;
  className?: string;
}

export function LiveExecutionDeck({
  activeAgent,
  activeAgentSlot,
  preview,
  renderSession,
  onRenderClose,
  onRenderComplete,
  creativeVideoDuration = 60,
  onCreativeVideoDurationChange,
  creativeVideoPipelineActive = false,
  creativeVideoPipelineProgress = 0,
  creativeVideoSourceFileName = null,
  creativeVideoSourcePreviewUrl = null,
  creativeVideoPipelinePhaseLabel,
  className,
}: LiveExecutionDeckProps) {
  const routeKey = activeAgentSlot ?? activeAgent.id;
  const showCreativeDuration =
    isCreativeVideoRoute(routeKey) && typeof onCreativeVideoDurationChange === "function";
  const agentDriven = isAgentDrivenDeckRoute(routeKey);
  const liveDeck = useAgentLiveDeck();
  const hasLiveOutput = preview != null || renderSession != null;
  const showAgentDeck =
    agentDriven ||
    liveDeck.anyStreaming ||
    liveDeck.analytics.active ||
    liveDeck.analytics.clientRuntime ||
    liveDeck.medical.active;
  const hasLiveMedia =
    preview != null &&
    (preview.type === "video" ||
      preview.type === "image" ||
      preview.type === "audio" ||
      Boolean(
        preview.music_track ||
          preview.video_url ||
          preview.image_url ||
          preview.images?.length,
      ));
  const hasVideoPreview =
    Boolean(preview?.video_url) || preview?.type === "video";
  const showGenericPreview = hasLiveOutput && !showAgentDeck;
  const showMediaDeck =
    renderSession != null ||
    hasVideoPreview ||
    (hasLiveMedia && !showAgentDeck);
  const slot = resolveAgentDeckSlot(routeKey);
  const AgentIcon = activeAgent.icon;

  return (
    <aside
      className={cn(
        "agent-deck-surface relative z-[60] flex min-h-0 min-w-0 flex-col overflow-hidden pointer-events-auto touch-manipulation isolate transition-[box-shadow,background] duration-500",
        "border-l omni-accent-border",
        className,
      )}
      style={{ background: "var(--omni-panel)", boxShadow: "inset 1px 0 0 var(--omni-border)" }}
    >
      <header
        className="shrink-0 border-b px-4 py-4 omni-accent-border"
        style={{ background: "linear-gradient(to bottom, color-mix(in srgb, var(--omni-accent) 8%, var(--omni-panel)), var(--omni-panel))" }}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider omni-accent-text omni-accent-border",
              (showAgentDeck || hasLiveOutput) && "omni-accent-bg omni-glow-sm",
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                (showAgentDeck || hasLiveOutput || liveDeck.anyStreaming) && "animate-pulse",
              )}
              style={{ background: "var(--omni-accent)" }}
            />
            {liveDeck.anyStreaming ? "Live Stream Sync" : "Live Sandbox Active"}
          </span>
          <Monitor className="h-4 w-4 shrink-0 omni-accent-text" style={{ opacity: 0.7 }} />
        </div>

        <div className="flex items-start gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border omni-accent-border omni-accent-bg omni-glow-sm"
          >
            <AgentIcon className="h-5 w-5 omni-accent-text" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] omni-accent-text" style={{ opacity: 0.8 }}>
              Active Architecture
            </p>
            <h2
              key={activeAgent.id}
              className="agent-deck-title mt-1 text-xl font-bold leading-tight tracking-tight omni-accent-text sm:text-2xl"
            >
              {activeAgent.deckTitle}
            </h2>
            <p className="mt-1 text-[11px]" style={{ color: "var(--omni-text-muted)" }}>{activeAgent.systemRole}</p>
          </div>
        </div>
      </header>

      {showCreativeDuration ? (
        <CreativeVideoDurationPanel
          duration={creativeVideoDuration}
          onDurationChange={onCreativeVideoDurationChange}
          pipelineActive={creativeVideoPipelineActive}
          pipelineProgress={creativeVideoPipelineProgress}
          sourceFileName={creativeVideoSourceFileName}
          sourcePreviewUrl={creativeVideoSourcePreviewUrl}
          pipelinePhaseLabel={creativeVideoPipelinePhaseLabel}
        />
      ) : null}

      <div className="relative z-50 min-h-0 flex-1 overflow-y-auto overflow-x-hidden pointer-events-auto touch-manipulation">
        {renderSession ? (
          <LiveRenderWorkspace
            session={renderSession}
            className="pointer-events-auto h-full w-full"
            onClose={onRenderClose}
            onComplete={onRenderComplete}
          />
        ) : showMediaDeck || showGenericPreview ? (
          <ExecutionWorkspacePanel preview={preview} embedded deckMode />
        ) : showAgentDeck ? (
          <AgentDeckViewport slot={slot} routeId={routeKey} />
        ) : (
          <AgentDeckViewport slot={slot} routeId={routeKey} />
        )}
      </div>
    </aside>
  );
}
