"use client";

import { useVisionaryAI } from "../../../lib/visionary/ai-context";

/** GPU / inference slot monitor. */
export function InferenceManager() {
  const { engine } = useVisionaryAI();
  const slots = engine.inference.listSlots();

  return (
    <div className="p-2">
      <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-500">Inference</p>
      <ul className="mt-2 space-y-1">
        {slots.map((s) => (
          <li key={s.id} className="rounded border border-white/[0.06] px-2 py-1.5">
            <div className="flex justify-between text-[10px] text-slate-300">
              <span>{s.label}</span>
              <span>{s.gpuUtilization}%</span>
            </div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-black/40">
              <div className="h-full bg-cyan-500/80" style={{ width: `${s.gpuUtilization}%` }} />
            </div>
            <p className="mt-0.5 text-[8px] text-slate-600">
              {s.providerId} · {s.activeJobId ? `job ${s.activeJobId.slice(-6)}` : "idle"}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
