"use client";

import { useState } from "react";
import { cn } from "../../../lib/utils";
import { AI_WORKFLOWS, useVisionaryAI } from "../../../lib/visionary/ai-context";
import type { AIWorkflowKind } from "../../../lib/visionary/ai/types";
import { PromptProcessor } from "./PromptProcessor";
import { ModelRouter } from "./ModelRouter";
import { GenerationQueue } from "./GenerationQueue";
import { GenerationHistory } from "./GenerationHistory";
import { AssetManager } from "./AssetManager";
import { BrandKitPanel } from "./BrandKitPanel";
import { ProjectManagerPanel } from "./ProjectManagerPanel";

type AITab = "create" | "queue" | "history" | "assets" | "brand" | "projects";

/**
 * Central AI Creative Engine workspace — composes Phase 2 panels.
 */
export function VisionaryAIEngine() {
  const { activeWorkflow } = useVisionaryAI();
  const [tab, setTab] = useState<AITab>("create");

  return (
    <div className="visionary-ai-engine flex h-full min-h-0 flex-col overflow-hidden bg-[#0B0F19]">
      <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-white/[0.06] bg-[#0a0e16] px-2 py-1">
        {(
          [
            ["create", "Create"],
            ["queue", "Queue"],
            ["history", "History"],
            ["assets", "Assets"],
            ["brand", "Brand Kit"],
            ["projects", "Projects"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "shrink-0 rounded px-2.5 py-1 text-[10px] transition-colors",
              tab === id ? "bg-cyan-500/15 text-cyan-200" : "text-slate-500 hover:text-slate-300",
            )}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto shrink-0 text-[9px] text-slate-600">
          {AI_WORKFLOWS.find((w) => w.id === activeWorkflow)?.label}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {tab === "create" ? (
          <div className="flex h-full min-h-0">
            <div className="w-[min(420px,45%)] shrink-0 border-r border-white/[0.06]">
              <PromptProcessor />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="shrink-0 border-b border-white/[0.06] p-2">
                <ModelRouter compact />
              </div>
              <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#1a1033] p-6">
                <PreviewPlaceholder workflow={activeWorkflow} />
              </div>
            </div>
          </div>
        ) : null}
        {tab === "queue" ? <GenerationQueue full /> : null}
        {tab === "history" ? <GenerationHistory full /> : null}
        {tab === "assets" ? <AssetManager full /> : null}
        {tab === "brand" ? <BrandKitPanel /> : null}
        {tab === "projects" ? <ProjectManagerPanel /> : null}
      </div>
    </div>
  );
}

function PreviewPlaceholder({ workflow }: { workflow: AIWorkflowKind }) {
  const output =
    workflow.includes("video") || workflow === "text-to-cinematic"
      ? "Video"
      : workflow === "text-to-3d"
        ? "3D"
        : "Image";

  return (
    <div className="w-full max-w-lg rounded-xl border border-white/[0.08] bg-black/40 p-8 text-center shadow-2xl">
      <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/5">
        <span className="text-2xl font-light text-cyan-400/60">{output}</span>
      </div>
      <p className="text-sm font-medium text-slate-200">Generation Preview</p>
      <p className="mt-1 text-[10px] text-slate-500">
        Outputs appear here when queue jobs complete — architecture ready for model adapters.
      </p>
    </div>
  );
}
