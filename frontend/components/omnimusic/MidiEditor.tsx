"use client";

import { useOmniMusicStudio } from "../../lib/omnimusic-studio-context";

export function MidiEditor() {
  const { midiNotes, selectedTrackId, tracks } = useOmniMusicStudio();
  const track = tracks.find((t) => t.id === selectedTrackId);

  return (
    <div className="border-b border-white/[0.04] p-2">
      <p className="mb-1 text-[9px] uppercase text-slate-600">MIDI Editor</p>
      {track?.kind === "midi" || track?.kind === "instrument" ? (
        <p className="text-[8px] text-slate-500">{midiNotes.length} notes · Chord view · MIDI tools</p>
      ) : (
        <p className="text-[8px] text-slate-600">Select a MIDI track</p>
      )}
    </div>
  );
}
