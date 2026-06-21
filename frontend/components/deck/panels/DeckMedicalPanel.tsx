"use client";

import { Activity, Camera, ChevronDown, FileUp, Scan } from "lucide-react";
import { deckChip, deckChipActive, deckRow } from "../../../lib/deck-interactive";
import {
  setMedicalExpanded,
  useAgentLiveDeck,
} from "../../../lib/agent-live-deck-store";
import {
  runMedicalPipeline,
  setMedicalScanMode,
  useAgentPipeline,
} from "../../../lib/agent-pipeline-store";
import { cn } from "../../../lib/utils";
import { DeckMicroLoader } from "../DeckMicroLoader";
import { DeckShell } from "../DeckShell";

export function DeckMedicalPanel() {
  const { loading, error, result, scanMode } = useAgentPipeline("medical");
  const medicalLive = useAgentLiveDeck().medical;

  const pills =
    medicalLive.indicators.length > 0
      ? medicalLive.indicators
      : result
        ? result.analyzed_indicators.map((ind, i) => ({
            id: `api-${i}`,
            label: ind,
            severity: result.severity as "low" | "moderate" | "high",
            detail: result.predicted_ailment,
            solutions: result.recommended_solutions,
          }))
        : [];

  const modes = [
    { id: "report" as const, icon: FileUp, label: "Reports" },
    { id: "xray" as const, icon: Scan, label: "X-ray" },
    { id: "facial" as const, icon: Camera, label: "Facial video" },
  ];

  return (
    <DeckShell title="Clinical assessment sheet" subtitle="Stream + scan driven indicators">
      {(loading || medicalLive.streaming) && (
        <DeckMicroLoader label="Analyzing scan / symptom stream…" />
      )}

      {error ? <p className="text-xs text-red-400/90">{error}</p> : null}

      {pills.length > 0 ? (
        <div className="space-y-1.5">
          <p className="text-[9px] font-bold uppercase tracking-wider text-[#10B981]">
            Indicator pills · tap to expand
          </p>
          {pills.map((pill) => {
            const expanded = medicalLive.expandedId === pill.id;
            return (
              <div
                key={pill.id}
                className={cn(
                  "overflow-hidden rounded-lg border transition-all",
                  expanded
                    ? "border-emerald-500/60 bg-emerald-500/5"
                    : "border-emerald-500/20 bg-[#0B0C10] hover:border-emerald-500/60",
                )}
              >
                <button
                  type="button"
                  onClick={() => setMedicalExpanded(expanded ? null : pill.id)}
                  className={cn(deckRow, "border-0")}
                >
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[9px] font-semibold",
                      pill.severity === "high"
                        ? "border-red-500/40 text-red-400"
                        : pill.severity === "moderate"
                          ? "border-amber-500/40 text-amber-300"
                          : "border-emerald-500/40 text-[#00FF87]",
                    )}
                  >
                    {pill.label}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-[#10B981] transition-transform",
                      expanded && "rotate-180",
                    )}
                  />
                </button>
                {expanded ? (
                  <div className="border-t border-emerald-500/15 px-2.5 pb-2 pt-1">
                    <p className="text-[9px] text-zinc-500">{pill.detail}</p>
                    <ul className="mt-2 space-y-1">
                      {pill.solutions.map((s) => (
                        <li
                          key={s}
                          className="rounded border border-emerald-500/15 bg-[#15171E]/80 px-2 py-1 text-[10px] text-zinc-300"
                        >
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <div className={cn(deckChip, "border-dashed p-4 text-center")}>
          <Activity className="mx-auto h-8 w-8 text-[#10B981]/40" />
          <p className="mt-2 text-[10px] text-zinc-500">
            Send symptoms in Medical chat — pills populate live from the stream.
          </p>
        </div>
      )}

      {result ? (
        <p className="text-[8px] text-zinc-600">{result.disclaimer}</p>
      ) : null}

      <div className="flex gap-1">
        {modes.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setMedicalScanMode(id);
              void runMedicalPipeline({
                symptom_text: "clinical scan review",
                file_names: [],
                scan_mode: id,
              });
            }}
            className={cn(
              deckChip,
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-[9px]",
              scanMode === id && deckChipActive,
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>
    </DeckShell>
  );
}
