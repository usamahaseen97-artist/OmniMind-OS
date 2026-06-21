"use client";

import { memo } from "react";
import { Sparkles } from "lucide-react";
import { isArchitectWizardRoute } from "../../lib/architect-flow";
import { getQuickSuggestions } from "../../lib/chat-suggestions";
import { getOmniTool } from "../../lib/omni-tools";
import type { OmniRouteId } from "../../lib/omni-tools";
import { NEURAL_CHATBOT_LABEL } from "../../lib/brand-labels";
import { cn } from "../../lib/utils";
import { OmniArchitectWizard } from "../architect/OmniArchitectWizard";
import type { GeneratedFileAsset } from "../../lib/execution-preview";
import type { ArchitectFlowSelections } from "../../lib/architect-flow";
import { previewFromApi } from "../../lib/execution-preview";

interface CentralSuggestionHubProps {
  routeId: OmniRouteId | string;
  onFill: (text: string) => void;
  className?: string;
  userId?: string;
  onArchitectPreview?: (preview: ReturnType<typeof previewFromApi>) => void;
  /** Workbench embed — branding + chips live in AgentChatConsole footer */
  workbenchUnified?: boolean;
  /** Gemini full-screen — centered greeting banner */
  geminiLayout?: boolean;
  geminiDisplayName?: string;
}

function CentralSuggestionHubInner({
  routeId,
  onFill,
  className,
  userId,
  onArchitectPreview,
  workbenchUnified = false,
  geminiLayout = false,
  geminiDisplayName = "Usama",
}: CentralSuggestionHubProps) {
  const tool = getOmniTool(routeId);
  const suggestions = getQuickSuggestions(routeId);
  const showWizard = isArchitectWizardRoute(routeId) && !workbenchUnified;

  const handleArchitectComplete = (result: {
    files: GeneratedFileAsset[];
    selections: ArchitectFlowSelections;
  }) => {
    onArchitectPreview?.(
      previewFromApi(
        {
          type: "app_build",
          active_tab: "code",
          files: result.files,
        },
        tool.name,
      ),
    );
    onFill(buildArchitectSummary(result.selections));
  };

  if (workbenchUnified) {
    return (
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-6 text-center",
          className,
        )}
      >
        <p className="max-w-xs text-[10px] leading-relaxed text-zinc-600">
          Use the prompt dock below — macro suggestions and component chips pre-fill your message.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto overscroll-y-contain px-4 py-8 text-center",
        geminiLayout ? "justify-center" : "justify-start px-3 py-4",
        className,
      )}
    >
      {geminiLayout ? (
        <h1 className="mb-2 max-w-2xl text-center text-4xl font-medium tracking-tight bg-gradient-to-r from-blue-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
          What&apos;s the vibe, {geminiDisplayName}?
        </h1>
      ) : (
        <>
          <div className="mb-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border omni-accent-border omni-accent-bg omni-glow-sm">
            <Sparkles className="h-5 w-5 omni-accent-text" />
          </div>
          <h2 className="shrink-0 text-lg font-semibold tracking-tight text-zinc-100 sm:text-xl">
            {tool.id === "dashboard" ? NEURAL_CHATBOT_LABEL : tool.name}
          </h2>
          <p className="mt-0.5 shrink-0 text-[10px] font-medium uppercase tracking-[0.3em] omni-accent-text" style={{ opacity: 0.85 }}>
            {tool.tagline}
          </p>
        </>
      )}

      {showWizard ? (
        <div className="mt-4 w-full max-w-lg text-left">
          <OmniArchitectWizard
            userId={userId}
            onComplete={handleArchitectComplete}
            onFillChat={onFill}
          />
        </div>
      ) : null}

      {!geminiLayout ? (
        <div className="mt-6 flex w-full max-w-xl flex-col gap-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
            Quick prompts
          </p>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onFill(s)}
              title={s}
              className={cn(
                "w-full truncate rounded-full border bg-transparent px-3 py-2 text-left text-[11px]",
                "transition-all duration-200 omni-accent-border hover:omni-accent-bg hover:omni-accent-text active:scale-[0.99]",
              )}
              style={{ borderColor: "var(--omni-border)", color: "var(--omni-text-muted)" }}
            >
              {s}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function buildArchitectSummary(selections: ArchitectFlowSelections): string {
  return [
    "Build this full-stack project:",
    selections.projectPrompt,
    `Stack: ${selections.frontendId ?? "nextjs"} + ${selections.backendId ?? "fastapi"} + ${selections.databaseId ?? "manual"}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export const CentralSuggestionHub = memo(CentralSuggestionHubInner);
