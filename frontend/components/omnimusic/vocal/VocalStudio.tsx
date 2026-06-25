"use client";

import { cn } from "../../../lib/utils";
import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";
import { RecordingWorkspace } from "./RecordingWorkspace";
import { VoiceAnalyzer } from "./VoiceAnalyzer";
import { PitchAnalyzer } from "./PitchAnalyzer";
import { AutoTuneEngine } from "./AutoTuneEngine";
import { VoiceCleaner } from "./VoiceCleaner";
import { NoiseReducer } from "./NoiseReducer";
import { BreathRemoval } from "./BreathRemoval";
import { DeEsser } from "./DeEsser";
import { EQAssistant } from "./EQAssistant";
import { CompressorAssistant } from "./CompressorAssistant";
import { ReverbAssistant } from "./ReverbAssistant";
import { DelayAssistant } from "./DelayAssistant";
import { HarmonyEngine as VocalHarmonyPanel } from "./HarmonyEngine";
import { DoubleTracking } from "./DoubleTracking";
import { ChoirGenerator } from "./ChoirGenerator";
import { BackingVocals } from "./BackingVocals";
import { LyricsSync } from "./LyricsSync";
import { PronunciationGuide } from "./PronunciationGuide";
import { VoiceLibrary } from "./VoiceLibrary";
import { TakeManager } from "./TakeManager";
import { CompEditor } from "./CompEditor";
import { PerformanceMonitor } from "./PerformanceMonitor";
import { VocalAssistant } from "./VocalAssistant";

const PANELS = [
  { id: "record" as const, label: "Record" },
  { id: "analyze" as const, label: "Analyze" },
  { id: "process" as const, label: "Process" },
  { id: "lyrics" as const, label: "Lyrics" },
  { id: "library" as const, label: "Library" },
  { id: "assistant" as const, label: "Assistant" },
];

export function VocalStudio() {
  const { vocalPanel, setVocalPanel } = useOmniMusicStudio();

  return (
    <div className="flex h-full flex-col bg-[#080a0e]">
      <div className="flex shrink-0 flex-wrap gap-0.5 border-b border-white/[0.06] p-1">
        {PANELS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setVocalPanel(p.id)}
            className={cn("rounded px-2 py-0.5 text-[8px]", vocalPanel === p.id ? "bg-cyan-500/15 text-cyan-200" : "text-slate-600")}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {vocalPanel === "record" ? (
          <>
            <RecordingWorkspace />
            <TakeManager />
            <CompEditor />
            <PerformanceMonitor />
          </>
        ) : null}
        {vocalPanel === "analyze" ? (
          <>
            <VoiceAnalyzer />
            <PitchAnalyzer />
          </>
        ) : null}
        {vocalPanel === "process" ? (
          <div className="space-y-2">
            <AutoTuneEngine />
            <VocalHarmonyPanel />
            <DoubleTracking />
            <VoiceCleaner />
            <NoiseReducer />
            <BreathRemoval />
            <DeEsser />
            <EQAssistant />
            <CompressorAssistant />
            <ReverbAssistant />
            <DelayAssistant />
            <ChoirGenerator />
            <BackingVocals />
          </div>
        ) : null}
        {vocalPanel === "lyrics" ? (
          <>
            <LyricsSync />
            <PronunciationGuide />
          </>
        ) : null}
        {vocalPanel === "library" ? <VoiceLibrary /> : null}
        {vocalPanel === "assistant" ? <VocalAssistant /> : null}
      </div>
    </div>
  );
}
