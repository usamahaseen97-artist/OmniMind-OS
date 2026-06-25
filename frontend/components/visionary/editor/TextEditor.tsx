"use client";

import { TEXT_TEMPLATES } from "../../../lib/visionary/editor/constants";
import { useVisionaryEditor } from "../../../lib/visionary/editor-context";

export function TextEditor() {
  const { textLayers, addTextLayer } = useVisionaryEditor();

  return (
    <div className="space-y-3 p-3">
      <p className="text-[9px] uppercase text-slate-600">Title Templates</p>
      <div className="grid gap-1">
        {TEXT_TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => addTextLayer(t.id)}
            className="rounded border border-white/[0.06] px-2 py-2 text-left text-[10px] text-slate-300 hover:border-cyan-500/25"
          >
            {t.label}
          </button>
        ))}
      </div>
      {textLayers.length > 0 ? (
        <ul className="space-y-2 border-t border-white/[0.04] pt-2">
          {textLayers.map((l) => (
            <li key={l.id} className="rounded bg-white/[0.03] p-2">
              <input
                defaultValue={l.content}
                className="w-full bg-transparent text-[11px] text-slate-200 outline-none"
              />
              <p className="mt-1 text-[8px] text-slate-600">
                {l.fontFamily} {l.fontSize}px · {l.alignment}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
