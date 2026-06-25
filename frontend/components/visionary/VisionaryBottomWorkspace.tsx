"use client";

import { cn } from "../../lib/utils";
import { useVisionaryAI } from "../../lib/visionary/ai-context";
import { VisionaryTimeline } from "./VisionaryTimeline";
import { GenerationQueue } from "./ai/GenerationQueue";
import { GenerationHistory } from "./ai/GenerationHistory";

/** Bottom panel — timeline or AI queue/history. */
export function VisionaryBottomWorkspace() {
  const { bottomPanelMode, setBottomPanelMode } = useVisionaryAI();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-7 shrink-0 items-center gap-1 border-b border-white/[0.06] bg-[#060a10] px-2">
        {(
          [
            ["timeline", "Timeline"],
            ["queue", "Queue"],
            ["history", "History"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setBottomPanelMode(id)}
            className={cn(
              "rounded px-2 py-0.5 text-[9px]",
              bottomPanelMode === id ? "bg-white/10 text-slate-200" : "text-slate-500 hover:text-slate-300",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        {bottomPanelMode === "timeline" ? <VisionaryTimeline /> : null}
        {bottomPanelMode === "queue" ? <GenerationQueue full /> : null}
        {bottomPanelMode === "history" ? <GenerationHistory full /> : null}
      </div>
    </div>
  );
}
