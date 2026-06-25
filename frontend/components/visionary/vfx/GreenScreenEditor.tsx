"use client";

import { DEFAULT_CHROMA_KEY } from "../../../lib/visionary/vfx/constants";
import { useVisionaryVFX } from "../../../lib/visionary/vfx-context";

export function GreenScreenEditor() {
  const { chromaKey, updateChromaKey } = useVisionaryVFX();

  return (
    <div className="flex h-full flex-col overflow-y-auto p-2">
      <p className="mb-2 text-[9px] font-semibold uppercase text-emerald-400/80">Green Screen</p>

      <label className="mb-2 block text-[8px] text-slate-500">
        Key Color
        <input
          type="color"
          value={chromaKey.keyColor}
          onChange={(e) => updateChromaKey({ keyColor: e.target.value })}
          className="mt-1 h-6 w-full cursor-pointer rounded border border-white/10"
        />
      </label>

      {(["tolerance", "spillSuppression", "edgeRefinement", "hairRefinement"] as const).map((key) => (
        <label key={key} className="mb-2 block text-[8px] text-slate-500">
          {key.replace(/([A-Z])/g, " $1")}
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(chromaKey[key] * 100)}
            onChange={(e) => updateChromaKey({ [key]: Number(e.target.value) / 100 })}
            className="mt-0.5 w-full"
          />
        </label>
      ))}

      <label className="mb-2 flex items-center gap-2 text-[9px] text-slate-400">
        <input
          type="checkbox"
          checked={chromaKey.garbageMaskId !== null}
          onChange={(e) =>
            updateChromaKey({ garbageMaskId: e.target.checked ? "garbage-1" : null })
          }
        />
        Garbage Mask
      </label>

      <button
        type="button"
        onClick={() => updateChromaKey(DEFAULT_CHROMA_KEY)}
        className="mt-auto rounded border border-white/10 py-1 text-[9px] text-slate-500"
      >
        Reset to Default
      </button>
    </div>
  );
}
