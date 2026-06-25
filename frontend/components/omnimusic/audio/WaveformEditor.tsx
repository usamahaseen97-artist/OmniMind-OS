"use client";

import type { WaveformEditOp } from "../../../lib/omnimusic-studio/audio-types";
import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";
import { WaveformRenderer } from "./WaveformRenderer";

const OPS: { op: WaveformEditOp; label: string }[] = [
  { op: "split", label: "Split" },
  { op: "trim", label: "Trim" },
  { op: "fadeIn", label: "Fade In" },
  { op: "fadeOut", label: "Fade Out" },
  { op: "normalize", label: "Normalize" },
  { op: "reverse", label: "Reverse" },
  { op: "duplicate", label: "Duplicate" },
  { op: "silence", label: "Silence" },
];

export function WaveformEditor() {
  const {
    clips,
    selectedClipId,
    setSelectedClipId,
    waveforms,
    waveformView,
    setWaveformZoom,
    setWaveformSelection,
    applyWaveformEdit,
  } = useOmniMusicStudio();

  const clip = clips.find((c) => c.id === selectedClipId);
  const waveform = clip?.waveformId ? waveforms[clip.waveformId] ?? null : null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {clips.filter((c) => c.waveformId).map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelectedClipId(c.id)}
            className={`rounded px-1.5 py-0.5 text-[8px] ${selectedClipId === c.id ? "bg-pink-500/15 text-pink-200" : "text-slate-600"}`}
          >
            {c.name}
          </button>
        ))}
      </div>
      <WaveformRenderer
        waveform={waveform}
        zoom={waveformView.zoom}
        selection={waveformView.selection}
        onSelect={(start, end) => setWaveformSelection({ clipId: selectedClipId ?? "", startSample: start, endSample: end })}
      />
      <div className="flex flex-wrap items-center gap-1">
        <button type="button" onClick={() => setWaveformZoom(waveformView.zoom * 1.25)} className="text-[8px] text-slate-500">Zoom +</button>
        <button type="button" onClick={() => setWaveformZoom(waveformView.zoom / 1.25)} className="text-[8px] text-slate-500">Zoom −</button>
        {OPS.map(({ op, label }) => (
          <button
            key={op}
            type="button"
            disabled={!waveform}
            onClick={() => applyWaveformEdit(op)}
            className="rounded border border-white/[0.06] px-1.5 py-0.5 text-[8px] text-slate-500 disabled:opacity-40"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
