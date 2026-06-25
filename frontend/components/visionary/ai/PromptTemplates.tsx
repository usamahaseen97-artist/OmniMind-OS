"use client";

import { useVisionaryAI } from "../../../lib/visionary/ai-context";

/** Built-in and saved prompt templates browser. */
export function PromptTemplates() {
  const { applyTemplate, savedPrompts, loadPrompt, engine } = useVisionaryAI();
  const builtIn = engine.templates.listBuiltIn();

  return (
    <div className="space-y-2 p-2">
      <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-500">Templates</p>
      <div className="grid gap-1">
        {builtIn.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => applyTemplate(t.id)}
            className="rounded border border-white/[0.06] bg-white/[0.02] px-2 py-2 text-left text-[10px] text-slate-300 hover:border-cyan-500/25"
          >
            {t.label}
          </button>
        ))}
      </div>
      {savedPrompts.length > 0 ? (
        <>
          <p className="pt-2 text-[9px] text-slate-600">Saved</p>
          {savedPrompts.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => loadPrompt(p)}
              className="block w-full truncate text-left text-[9px] text-slate-500 hover:text-cyan-300"
            >
              {p.label}
            </button>
          ))}
        </>
      ) : null}
    </div>
  );
}
