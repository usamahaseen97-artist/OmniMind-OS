"use client";

import { useVisionaryAI } from "../../../lib/visionary/ai-context";

/** Prompt optimizer UI — surfaces score and suggestions. */
export function PromptOptimizer() {
  const { optimizationScore, optimizationSuggestions, optimizePrompt } = useVisionaryAI();

  return (
    <div className="rounded border border-white/[0.06] bg-white/[0.02] p-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-medium text-slate-300">Prompt Optimizer</p>
        <button
          type="button"
          onClick={() => void optimizePrompt()}
          className="text-[9px] text-cyan-400 hover:text-cyan-300"
        >
          Run
        </button>
      </div>
      {optimizationScore !== null ? (
        <div className="mt-2">
          <div className="flex items-center justify-between text-[9px] text-slate-500">
            <span>Quality score</span>
            <span className="text-cyan-300">{optimizationScore}/100</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/40">
            <div className="h-full bg-cyan-500" style={{ width: `${optimizationScore}%` }} />
          </div>
        </div>
      ) : null}
      <ul className="mt-2 space-y-1 text-[9px] text-slate-500">
        {optimizationSuggestions.map((s) => (
          <li key={s}>• {s}</li>
        ))}
      </ul>
    </div>
  );
}
