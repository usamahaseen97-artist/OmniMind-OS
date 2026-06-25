"use client";

import { cn } from "../../../lib/utils";
import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";
import { PromptStudio } from "./PromptStudio";
import { MusicCopilot } from "./MusicCopilot";
import { BeatGenerator } from "./BeatGenerator";
import { LyricsStudio } from "./LyricsStudio";
import { GenerationQueue } from "./GenerationQueue";
import { GenerationHistory } from "./GenerationHistory";
import { MusicAssetLibrary } from "./MusicAssetLibrary";
import { MusicTemplates } from "./MusicTemplates";
import { ChordEngine } from "./ChordEngine";
import { MelodyEngine } from "./MelodyEngine";
import { HarmonyEngine } from "./HarmonyEngine";
import { RhythmEngine } from "./RhythmEngine";
import { ArrangementEngine } from "./ArrangementEngine";
import { ModelRouter } from "./ModelRouter";

const PANELS = [
  { id: "composer" as const, label: "Composer" },
  { id: "copilot" as const, label: "Copilot" },
  { id: "prompt" as const, label: "Prompt" },
  { id: "beat" as const, label: "Beat" },
  { id: "lyrics" as const, label: "Lyrics" },
  { id: "queue" as const, label: "Queue" },
  { id: "assets" as const, label: "Assets" },
  { id: "templates" as const, label: "Templates" },
];

export function AIComposer() {
  const { aiPanel, setAiPanel } = useOmniMusicStudio();

  return (
    <div className="flex h-full flex-col bg-[#080a0e]">
      <div className="flex shrink-0 flex-wrap gap-0.5 border-b border-white/[0.06] p-1">
        {PANELS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setAiPanel(p.id)}
            className={cn(
              "rounded px-2 py-0.5 text-[8px]",
              aiPanel === p.id ? "bg-violet-500/15 text-violet-200" : "text-slate-600",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {aiPanel === "composer" ? (
          <div className="space-y-3">
            <ChordEngine />
            <MelodyEngine />
            <HarmonyEngine />
            <RhythmEngine />
            <ArrangementEngine />
            <ModelRouter />
          </div>
        ) : null}
        {aiPanel === "copilot" ? <MusicCopilot /> : null}
        {aiPanel === "prompt" ? <PromptStudio /> : null}
        {aiPanel === "beat" ? <BeatGenerator /> : null}
        {aiPanel === "lyrics" ? <LyricsStudio /> : null}
        {aiPanel === "queue" ? (
          <>
            <GenerationQueue />
            <GenerationHistory />
          </>
        ) : null}
        {aiPanel === "assets" ? <MusicAssetLibrary /> : null}
        {aiPanel === "templates" ? <MusicTemplates /> : null}
      </div>
    </div>
  );
}
