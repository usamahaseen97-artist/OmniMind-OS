"use client";

import { ChevronDown, ChevronUp, Monitor } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import type { AgentArchitectureOption } from "../../lib/agent-architecture-options";
import {
  sandboxDeckShell,
  sandboxMainPane,
  sandboxSplit,
} from "../../lib/responsive-layout";
import { cn } from "../../lib/utils";
import type { CreativeVideoDurationSec } from "../../lib/creative-video-profiles";
import { LiveExecutionDeck } from "./LiveExecutionDeck";
import type { ExecutionPreviewState } from "../../lib/execution-preview";
import type { LiveRenderSession } from "../../lib/live-render-pipeline";

interface AgentSandboxSplitProps {
  activeAgent: AgentArchitectureOption;
  activeAgentSlot?: string;
  children: ReactNode;
  preview?: ExecutionPreviewState | null;
  renderSession?: LiveRenderSession | null;
  onRenderClose?: () => void;
  onRenderComplete?: () => void;
  creativeVideoDuration?: CreativeVideoDurationSec;
  onCreativeVideoDurationChange?: (sec: CreativeVideoDurationSec) => void;
  creativeVideoPipelineActive?: boolean;
  creativeVideoPipelineProgress?: number;
  creativeVideoSourceFileName?: string | null;
  creativeVideoSourcePreviewUrl?: string | null;
  creativeVideoPipelinePhaseLabel?: string;
  showLiveDeck?: boolean;
  className?: string;
}

/** Main chat + optional live deck. Deck hidden in sovereign workbench embeds. */
export function AgentSandboxSplit({
  activeAgent,
  activeAgentSlot,
  children,
  preview = null,
  renderSession = null,
  onRenderClose,
  onRenderComplete,
  creativeVideoDuration = 60,
  onCreativeVideoDurationChange,
  creativeVideoPipelineActive = false,
  creativeVideoPipelineProgress = 0,
  creativeVideoSourceFileName = null,
  creativeVideoSourcePreviewUrl = null,
  creativeVideoPipelinePhaseLabel,
  showLiveDeck = true,
  className,
}: AgentSandboxSplitProps) {
  const [mobileDeckOpen, setMobileDeckOpen] = useState(false);
  const hasLiveOutput = preview != null || renderSession != null;

  if (!showLiveDeck) {
    return <div className={cn("flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden", className)}>{children}</div>;
  }

  return (
    <div className={cn(sandboxSplit, className)}>
      <div className={sandboxMainPane}>{children}</div>

      <div
        className={cn(
          sandboxDeckShell,
          "max-lg:bg-[var(--omni-panel)]/95 max-lg:backdrop-blur-md",
          mobileDeckOpen ? "max-lg:max-h-[min(48vh,420px)]" : "max-lg:max-h-11",
        )}
      >
        <button
          type="button"
          onClick={() => setMobileDeckOpen((v) => !v)}
          className={cn(
            "flex w-full shrink-0 items-center justify-between gap-2 border-b px-3 py-2 lg:hidden omni-accent-border",
            "text-[11px] font-semibold uppercase tracking-wider omni-accent-text",
          )}
          style={{ background: "var(--omni-panel)" }}
          aria-expanded={mobileDeckOpen}
        >
          <span className="flex items-center gap-2">
            <Monitor className="h-3.5 w-3.5" />
            Live Sandbox
            {hasLiveOutput ? (
              <span className="h-1.5 w-1.5 animate-pulse rounded-full omni-accent-bg" style={{ background: "var(--omni-accent)" }} />
            ) : null}
          </span>
          {mobileDeckOpen ? (
            <ChevronDown className="h-4 w-4" style={{ color: "var(--omni-text-muted)" }} />
          ) : (
            <ChevronUp className="h-4 w-4" style={{ color: "var(--omni-text-muted)" }} />
          )}
        </button>

        <div
          className={cn(
            "relative z-[60] min-h-0 flex-1 overflow-hidden pointer-events-auto isolate",
            "max-lg:transition-[max-height] max-lg:duration-300",
            !mobileDeckOpen && "max-lg:hidden lg:block",
          )}
        >
          <LiveExecutionDeck
            activeAgent={activeAgent}
            activeAgentSlot={activeAgentSlot}
            preview={preview}
            renderSession={renderSession}
            onRenderClose={onRenderClose}
            onRenderComplete={onRenderComplete}
            creativeVideoDuration={creativeVideoDuration}
            onCreativeVideoDurationChange={onCreativeVideoDurationChange}
            creativeVideoPipelineActive={creativeVideoPipelineActive}
            creativeVideoPipelineProgress={creativeVideoPipelineProgress}
            creativeVideoSourceFileName={creativeVideoSourceFileName}
            creativeVideoSourcePreviewUrl={creativeVideoSourcePreviewUrl}
            creativeVideoPipelinePhaseLabel={creativeVideoPipelinePhaseLabel}
            className="h-full min-h-0 w-full border-l-0 lg:border-l omni-accent-border"
          />
        </div>
      </div>
    </div>
  );
}
