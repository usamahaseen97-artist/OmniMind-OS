"use client";

import { useOmniMusicStudio } from "../../lib/omnimusic-studio-context";
import { WaveformEditor } from "./audio/WaveformEditor";
import { ClipProcessor } from "./audio/ClipProcessor";
import { RegionEditor } from "./audio/RegionEditor";

export function AudioEditor() {
  const { selectedTrackId, tracks } = useOmniMusicStudio();
  const track = tracks.find((t) => t.id === selectedTrackId);

  return (
    <div className="border-b border-white/[0.04] p-2">
      <p className="mb-1 text-[9px] uppercase text-slate-600">Audio Editor</p>
      {track?.kind === "audio" ? (
        <>
          <WaveformEditor />
          <div className="mt-2">
            <ClipProcessor />
          </div>
          <div className="mt-2">
            <RegionEditor />
          </div>
        </>
      ) : (
        <p className="text-[8px] text-slate-600">Select an audio track</p>
      )}
    </div>
  );
}
