"use client";

import { cn } from "../../../lib/utils";
import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";
import { PodcastStudio } from "./PodcastStudio";
import { EpisodeManager } from "./EpisodeManager";
import { ChapterEditor } from "./ChapterEditor";
import { RemoteRecording } from "./RemoteRecording";
import { VoiceOverStudio } from "./VoiceOverStudio";
import { SpatialAudioStudio } from "./SpatialAudioStudio";
import { LiveStreamingHub } from "./LiveStreamingHub";
import { StreamingDashboard } from "./StreamingDashboard";
import { TranscriptStudio } from "./TranscriptStudio";
import { SubtitleGenerator } from "./SubtitleGenerator";
import { NoiseProfiler } from "./NoiseProfiler";
import { AudioRestoration } from "./AudioRestoration";
import { SoundLibrary } from "./SoundLibrary";
import { BroadcastTemplates } from "./BroadcastTemplates";

const PANELS = [
  { id: "podcast" as const, label: "Podcast" },
  { id: "voiceover" as const, label: "Voice Over" },
  { id: "spatial" as const, label: "Spatial" },
  { id: "streaming" as const, label: "Streaming" },
  { id: "transcripts" as const, label: "Transcripts" },
  { id: "restoration" as const, label: "Restoration" },
  { id: "library" as const, label: "Library" },
  { id: "assistant" as const, label: "Assistant" },
];

export function BroadcastWorkspace() {
  const { broadcastPanel, setBroadcastPanel, broadcastSuggestions } = useOmniMusicStudio();

  return (
    <div className="flex h-full flex-col bg-[#080a0e]">
      <div className="flex shrink-0 flex-wrap gap-0.5 border-b border-white/[0.06] p-1">
        {PANELS.map((p) => (
          <button key={p.id} type="button" onClick={() => setBroadcastPanel(p.id)} className={cn("rounded px-2 py-0.5 text-[8px]", broadcastPanel === p.id ? "bg-emerald-500/15 text-emerald-200" : "text-slate-600")}>{p.label}</button>
        ))}
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2">
        {broadcastPanel === "podcast" ? (
          <>
            <EpisodeManager />
            <PodcastStudio />
            <ChapterEditor />
            <RemoteRecording />
            <BroadcastTemplates />
          </>
        ) : null}
        {broadcastPanel === "voiceover" ? <VoiceOverStudio /> : null}
        {broadcastPanel === "spatial" ? <SpatialAudioStudio /> : null}
        {broadcastPanel === "streaming" ? (
          <>
            <LiveStreamingHub />
            <StreamingDashboard />
          </>
        ) : null}
        {broadcastPanel === "transcripts" ? (
          <>
            <TranscriptStudio />
            <SubtitleGenerator />
          </>
        ) : null}
        {broadcastPanel === "restoration" ? (
          <>
            <NoiseProfiler />
            <AudioRestoration />
          </>
        ) : null}
        {broadcastPanel === "library" ? <SoundLibrary /> : null}
        {broadcastPanel === "assistant" ? (
          <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
            <p className="mb-2 text-[9px] font-medium text-emerald-200/80">AI Broadcast Assistant</p>
            {broadcastSuggestions.map((s) => (
              <div key={s.id} className="mb-1 rounded border border-white/[0.04] px-2 py-1 text-[8px]">
                <span className="text-emerald-400/80">{s.category}</span>
                <span className="ml-2 text-slate-400">{s.title}</span>
                <p className="text-slate-600">{s.detail}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
