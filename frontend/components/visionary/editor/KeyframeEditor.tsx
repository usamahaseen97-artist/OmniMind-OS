"use client";

import { useVisionaryEditor } from "../../../lib/visionary/editor-context";

export function KeyframeEditor() {
  const { keyframes, addKeyframe, selectedClip, timelineView } = useVisionaryEditor();

  return (
    <div className="p-3">
      <p className="text-[9px] uppercase text-slate-600">Keyframes</p>
      {!selectedClip ? (
        <p className="mt-2 text-[10px] text-slate-600">Select a clip</p>
      ) : (
        <>
          <div className="mt-2 flex flex-wrap gap-1">
            {["opacity", "scale", "positionX", "rotation"].map((prop) => (
              <button
                key={prop}
                type="button"
                onClick={() => addKeyframe(prop, 100)}
                className="rounded border border-white/10 px-2 py-0.5 text-[8px] text-slate-400 hover:text-cyan-300"
              >
                + {prop}
              </button>
            ))}
          </div>
          <ul className="mt-3 space-y-1">
            {keyframes
              .filter((k) => k.clipId === selectedClip.id)
              .map((k) => (
                <li key={k.id} className="font-mono text-[9px] text-slate-500">
                  f{k.frame} · {k.property} = {k.value}
                </li>
              ))}
          </ul>
          <p className="mt-2 text-[8px] text-slate-700">Playhead: {timelineView.playheadFrame}</p>
        </>
      )}
    </div>
  );
}
