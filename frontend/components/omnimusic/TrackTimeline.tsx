"use client";

import { cn } from "../../lib/utils";
import { useOmniMusicStudio } from "../../lib/omnimusic-studio-context";

const BEATS = 32;

export function TrackTimeline() {
  const { tracks, clips, markers, transport, selectedTrackId, setSelectedTrackId, setSelectedClipId, addTrack, addClip } = useOmniMusicStudio();

  return (
    <div className="flex h-full flex-col bg-[#080a0e]">
      <div className="flex shrink-0 items-center gap-1 border-b border-white/[0.06] px-2 py-1">
        <span className="text-[9px] uppercase text-slate-600">Arrangement</span>
        <button type="button" onClick={() => addTrack("audio", "Audio")} className="text-[8px] text-pink-400">+Audio</button>
        <button type="button" onClick={() => addTrack("midi", "MIDI")} className="text-[8px] text-pink-400">+MIDI</button>
        <button type="button" onClick={() => addTrack("instrument", "Inst")} className="text-[8px] text-pink-400">+Inst</button>
      </div>
      <div className="relative min-h-0 flex-1 overflow-auto">
        <div className="sticky top-0 z-10 flex h-5 border-b border-white/[0.04] bg-[#0a0e16]" style={{ paddingLeft: 120 }}>
          {Array.from({ length: BEATS }, (_, i) => (
            <div key={i} className="w-8 shrink-0 border-r border-white/[0.04] text-center text-[7px] text-slate-600">{i + 1}</div>
          ))}
        </div>
        {tracks.filter((t) => t.kind !== "master").map((track) => (
          <div key={track.id} className="flex h-8 border-b border-white/[0.03]">
            <button
              type="button"
              onClick={() => setSelectedTrackId(track.id)}
              className={cn(
                "flex w-[120px] shrink-0 items-center gap-1 border-r border-white/[0.04] px-2 text-left text-[9px]",
                selectedTrackId === track.id ? "bg-pink-500/10 text-pink-200" : "text-slate-500",
              )}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: track.color }} />
              {track.name}
            </button>
            <div className="relative flex-1">
              {clips.filter((c) => c.trackId === track.id).map((clip) => (
                <button
                  key={clip.id}
                  type="button"
                  onClick={() => {
                    setSelectedTrackId(track.id);
                    setSelectedClipId(clip.id);
                  }}
                  className="absolute top-1 h-6 rounded border border-white/10 px-1 text-left text-[8px] text-white"
                  style={{
                    left: clip.startBeat * 32,
                    width: clip.durationBeats * 32,
                    backgroundColor: `${clip.color}66`,
                  }}
                >
                  {clip.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => addClip(track.id, "New Clip")}
                className="absolute inset-0 opacity-0 hover:opacity-100 hover:bg-pink-500/5"
                aria-label="Add clip"
              />
            </div>
          </div>
        ))}
        <div
          className="pointer-events-none absolute top-5 bottom-0 z-20 w-px bg-pink-400"
          style={{ left: 120 + transport.playheadBeat * 32 }}
        />
        {markers.map((m) => (
          <div key={m.id} className="absolute top-0 text-[7px] text-amber-400/80" style={{ left: 120 + m.beat * 32 }}>
            ▼{m.label}
          </div>
        ))}
      </div>
    </div>
  );
}
