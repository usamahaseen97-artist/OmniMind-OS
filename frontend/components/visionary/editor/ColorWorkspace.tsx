"use client";

import { useVisionaryEditor } from "../../../lib/visionary/editor-context";

const SLIDERS = [
  "exposure",
  "contrast",
  "highlights",
  "shadows",
  "whites",
  "blacks",
  "temperature",
  "tint",
  "saturation",
] as const;

export function ColorWorkspace() {
  const { colorGrade, setColorGrade } = useVisionaryEditor();

  return (
    <div className="space-y-2 p-3">
      <p className="text-[9px] uppercase text-slate-600">Color Grading</p>
      {SLIDERS.map((key) => (
        <label key={key} className="block">
          <span className="flex justify-between text-[8px] capitalize text-slate-600">
            <span>{key}</span>
            <span>{colorGrade[key]}</span>
          </span>
          <input
            type="range"
            min={-100}
            max={100}
            value={colorGrade[key]}
            onChange={(e) =>
              setColorGrade((g) => ({ ...g, [key]: Number(e.target.value) }))
            }
            className="w-full accent-cyan-400"
          />
        </label>
      ))}
      <label className="block pt-2">
        <span className="text-[8px] text-slate-600">LUT</span>
        <select
          value={colorGrade.lutId ?? ""}
          onChange={(e) =>
            setColorGrade((g) => ({ ...g, lutId: e.target.value || null }))
          }
          className="mt-0.5 w-full rounded border border-white/10 bg-black/40 px-1 py-1 text-[9px]"
        >
          <option value="">None</option>
          <option value="lut-cinematic">Cinematic</option>
          <option value="lut-vintage">Vintage</option>
          <option value="lut-bw">B&W</option>
        </select>
      </label>
      <div className="mt-3 rounded border border-dashed border-white/10 p-3 text-center text-[9px] text-slate-600">
        Scopes (Waveform / Vectorscope) — Phase 4
      </div>
    </div>
  );
}
