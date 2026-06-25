"use client";

import { useOmniMusicStudio } from "../../lib/omnimusic-studio-context";
import { RecordingEnginePanel } from "./audio/RecordingEngine";
import { TrackEnginePanel } from "./audio/TrackEngine";
import { MetronomeEnginePanel } from "./audio/MetronomeEngine";
import { LatencyManager } from "./audio/LatencyManager";

export function RecordingPanel() {
  return (
    <div className="border-b border-white/[0.04] p-2">
      <p className="mb-2 text-[9px] uppercase text-slate-600">Recording</p>
      <TrackEnginePanel />
      <div className="my-2">
        <RecordingEnginePanel />
      </div>
      <MetronomeEnginePanel />
      <div className="mt-2">
        <LatencyManager />
      </div>
    </div>
  );
}
