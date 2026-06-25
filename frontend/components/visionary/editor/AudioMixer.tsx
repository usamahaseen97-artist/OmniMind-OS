"use client";

import { useVisionaryEditor } from "../../../lib/visionary/editor-context";

export function AudioMixer() {
  const { audioMix, setAudioMix, selectedClip } = useVisionaryEditor();

  if (!selectedClip || !audioMix) {
    return <p className="p-3 text-[10px] text-slate-600">Select an audio or video clip</p>;
  }

  return (
    <div className="space-y-3 p-3 text-[10px]">
      <p className="font-medium text-slate-300">{selectedClip.label}</p>
      {/* Waveform placeholder */}
      <div className="flex h-12 items-end gap-px rounded bg-black/40 px-1 py-1">
        {Array.from({ length: 48 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-violet-500/50"
            style={{ height: `${25 + Math.abs(Math.sin(i * 0.35)) * 55}%` }}
          />
        ))}
      </div>
      <label className="block">
        <span className="text-[9px] text-slate-600">Gain (dB)</span>
        <input
          type="range"
          min={-24}
          max={12}
          value={audioMix.gainDb}
          onChange={(e) => setAudioMix((m) => (m ? { ...m, gainDb: Number(e.target.value) } : m))}
          className="w-full accent-violet-400"
        />
      </label>
      {[
        ["normalized", "Normalize"],
        ["noiseReduction", "Noise Reduction"],
        ["eqEnabled", "EQ"],
        ["compressionEnabled", "Compression"],
        ["voiceEnhanceEnabled", "Voice Enhance"],
      ].map(([key, label]) => (
        <label key={key} className="flex items-center gap-2 text-slate-400">
          <input
            type="checkbox"
            checked={audioMix[key as keyof typeof audioMix] as boolean}
            onChange={(e) =>
              setAudioMix((m) => (m ? { ...m, [key]: e.target.checked } : m))
            }
            className="accent-violet-400"
          />
          {label}
        </label>
      ))}
      <div className="grid grid-cols-2 gap-2">
        <label>
          <span className="text-[8px] text-slate-600">Fade In (f)</span>
          <input
            type="number"
            value={audioMix.fadeInFrames}
            onChange={(e) =>
              setAudioMix((m) => (m ? { ...m, fadeInFrames: Number(e.target.value) } : m))
            }
            className="mt-0.5 w-full rounded border border-white/10 bg-black/30 px-1 py-0.5"
          />
        </label>
        <label>
          <span className="text-[8px] text-slate-600">Fade Out (f)</span>
          <input
            type="number"
            value={audioMix.fadeOutFrames}
            onChange={(e) =>
              setAudioMix((m) => (m ? { ...m, fadeOutFrames: Number(e.target.value) } : m))
            }
            className="mt-0.5 w-full rounded border border-white/10 bg-black/30 px-1 py-0.5"
          />
        </label>
      </div>
    </div>
  );
}
