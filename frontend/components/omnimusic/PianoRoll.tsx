"use client";

import { useOmniMusicStudio } from "../../lib/omnimusic-studio-context";

export function PianoRoll() {
  const { midiNotes, addMidiNote, transport } = useOmniMusicStudio();
  const rows = Array.from({ length: 24 }, (_, i) => 72 - i);

  return (
    <div className="flex h-full flex-col border-t border-white/[0.06] bg-[#06080c]">
      <div className="flex shrink-0 items-center justify-between border-b border-white/[0.04] px-2 py-0.5">
        <span className="text-[8px] uppercase text-slate-600">Piano Roll</span>
        <div className="flex gap-2 text-[8px] text-slate-600">
          <span>Quantize</span><span>Snap</span><span>Scale</span><span>Ghost Notes</span>
        </div>
        <button type="button" onClick={() => addMidiNote(60 + Math.floor(Math.random() * 12), transport.playheadBeat, 1, 100)} className="text-[8px] text-pink-400">+ Note</button>
      </div>
      <div className="relative min-h-0 flex-1 overflow-auto">
        {rows.map((pitch) => (
          <div key={pitch} className="relative h-3 border-b border-white/[0.03]">
            <span className="absolute left-1 text-[6px] text-slate-700">{pitch}</span>
            {midiNotes.filter((n) => n.pitch === pitch).map((n) => (
              <div
                key={n.id}
                className="absolute top-0.5 h-2 rounded bg-pink-500/60"
                style={{ left: 40 + n.startBeat * 24, width: n.durationBeats * 24 }}
                title={`vel ${n.velocity}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
