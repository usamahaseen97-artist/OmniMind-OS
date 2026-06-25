"use client";

import { Copy, Download, Edit, RefreshCw } from "lucide-react";
import { cn } from "../../../lib/utils";
import { createDefaultPrompt } from "../../../lib/visionary/ai/constants";
import { useVisionaryAI } from "../../../lib/visionary/ai-context";
import { AI_WORKFLOWS } from "../../../lib/visionary/ai-context";

/** Generation history — reopen, duplicate, remix, export. */
export function GenerationHistory({ full = false }: { full?: boolean }) {
  const { historyRecords, duplicateHistory, remixHistory, loadPrompt } = useVisionaryAI();
  const items = full ? historyRecords : historyRecords.slice(0, 8);

  return (
    <div className={cn("flex flex-col", full ? "h-full" : "")}>
      <div className="shrink-0 border-b border-white/[0.06] px-3 py-2">
        <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-500">Generation History</p>
        <p className="text-[10px] text-slate-600">{historyRecords.length} records</p>
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto p-2 space-y-1">
        {items.length === 0 ? (
          <li className="py-8 text-center text-[10px] text-slate-600">No generations yet</li>
        ) : (
          items.map((rec) => (
            <li
              key={rec.id}
              className="flex gap-2 rounded border border-white/[0.06] bg-white/[0.02] p-2"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-gradient-to-br from-slate-700 to-slate-900 text-[8px] uppercase text-slate-500">
                {rec.workflow.split("-").pop()?.slice(0, 4)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium text-slate-200">
                  {AI_WORKFLOWS.find((w) => w.id === rec.workflow)?.label ?? rec.workflow}
                </p>
                <p className="truncate text-[9px] text-slate-500">{rec.promptSummary}</p>
                <p className="text-[8px] text-slate-600">
                  {rec.createdAt.slice(0, 19).replace("T", " ")} · {rec.providerId}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-0.5">
                <button
                  type="button"
                  title="Reopen"
                  onClick={() => {
                    const draft = createDefaultPrompt(rec.workflow);
                    draft.positive = rec.promptSummary;
                    loadPrompt(draft);
                  }}
                  className="visionary-timeline-btn"
                >
                  <Edit size={11} />
                </button>
                <button type="button" title="Duplicate" onClick={() => duplicateHistory(rec.id)} className="visionary-timeline-btn">
                  <Copy size={11} />
                </button>
                <button type="button" title="Remix" onClick={() => remixHistory(rec.id)} className="visionary-timeline-btn">
                  <RefreshCw size={11} />
                </button>
                <button type="button" title="Export" className="visionary-timeline-btn">
                  <Download size={11} />
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
