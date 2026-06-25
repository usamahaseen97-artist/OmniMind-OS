"use client";

import { useOmniMindBrainOptional } from "../../lib/omnimind-brain-context";
import { cn } from "../../lib/utils";

export function BrainThinkingPipeline({ compact }: { compact?: boolean }) {
  const brain = useOmniMindBrainOptional();
  if (!brain || (!brain.thinking && brain.pipeline.every((s) => s.status === "pending"))) return null;

  return (
    <div
      className={cn(
        "border-b border-white/[0.06] bg-[rgba(8,10,16,0.95)]",
        compact ? "px-2 py-1.5" : "px-3 py-2",
      )}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-[8px] font-bold uppercase tracking-widest text-cyan-400/90">
          {brain.thinking ? "AI Thinking" : "Pipeline"}
        </span>
        <span className="font-mono text-[8px] text-zinc-500">
          {brain.confidence}% · ~{Math.max(1, Math.round(brain.etaMs / 1000))}s
        </span>
      </div>
      <div className="flex gap-1 overflow-x-auto pb-0.5">
        {brain.pipeline.map((stage) => (
          <div
            key={stage.id}
            title={stage.message}
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[7px] font-semibold uppercase tracking-wide",
              stage.status === "active" && "animate-pulse bg-cyan-500/20 text-cyan-200 ring-1 ring-cyan-400/30",
              stage.status === "done" && "bg-emerald-500/15 text-emerald-300",
              stage.status === "error" && "bg-red-500/15 text-red-300",
              stage.status === "pending" && "bg-white/5 text-zinc-600",
            )}
          >
            {stage.label}
          </div>
        ))}
      </div>
    </div>
  );
}
