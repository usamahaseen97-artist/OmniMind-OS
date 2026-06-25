"use client";

import { STUDIO_3D_AI_ACTIONS } from "../../../lib/visionary/studio3d/constants";
import { useVisionaryStudio3D } from "../../../lib/visionary/studio3d-context";

export function AI3DPanel() {
  const { aiTasks, runAIAction } = useVisionaryStudio3D();

  return (
    <div className="mt-auto border-t border-white/[0.06] p-2">
      <p className="mb-2 text-[9px] uppercase text-slate-600">AI 3D Tools</p>
      <div className="flex flex-wrap gap-1">
        {STUDIO_3D_AI_ACTIONS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => runAIAction(a.id)}
            className="rounded bg-violet-500/10 px-1.5 py-0.5 text-[7px] text-violet-300 hover:bg-violet-500/20"
          >
            {a.label}
          </button>
        ))}
      </div>
      {aiTasks[0] ? (
        <p className="mt-2 text-[8px] text-slate-600">{aiTasks[0].action} · {aiTasks[0].progress}%</p>
      ) : null}
    </div>
  );
}
