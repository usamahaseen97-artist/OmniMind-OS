"use client";

import { useOmniMindBrainOptional } from "../../lib/omnimind-brain-context";
import { specialistForId } from "../../core/brain";

export function BrainTaskPlannerView() {
  const brain = useOmniMindBrainOptional();
  const plan = brain?.plan;
  if (!plan) return null;

  return (
    <div className="space-y-1.5 p-2">
      <div className="rounded-lg border border-white/[0.06] bg-black/20 px-2 py-1.5">
        <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Task Planner</p>
        <p className="mt-0.5 text-[10px] text-zinc-200">{plan.goal}</p>
        <p className="text-[8px] text-zinc-500">{plan.subtasks.length} steps · {plan.confidence}% confidence</p>
      </div>
      <ul className="space-y-1">
        {plan.subtasks.map((st) => {
          const spec = st.specialistId ? specialistForId(st.specialistId) : undefined;
          return (
            <li key={st.id} className="rounded border border-white/[0.05] bg-white/[0.02] px-2 py-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[10px] text-zinc-300">{st.label}</span>
                <span className="text-[7px] uppercase text-zinc-500">{st.status}</span>
              </div>
              <div className="mt-0.5 flex items-center justify-between text-[8px] text-zinc-600">
                <span>{spec?.title ?? st.toolId}</span>
                <span>{st.progress}%</span>
              </div>
              <div className="mt-1 h-0.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full bg-indigo-500/50 transition-all" style={{ width: `${st.progress}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
