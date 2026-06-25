"use client";

import { useVisionaryStudio3D } from "../../../lib/visionary/studio3d-context";

export function RiggingStudio() {
  const { rigs, addRig } = useVisionaryStudio3D();

  return (
    <div className="flex h-full flex-col p-4">
      <p className="mb-3 text-[10px] font-semibold uppercase text-cyan-400">Rigging Studio</p>
      <button type="button" onClick={() => addRig("Humanoid Rig")} className="mb-3 w-fit rounded border border-cyan-500/30 px-2 py-1 text-[9px] text-cyan-300">+ New Rig</button>
      <div className="mb-4 flex gap-2 text-[8px] text-slate-600"><span>IK</span><span>FK</span><span>Skeleton</span><span>Pose Library</span></div>
      <ul className="space-y-1">
        {rigs.map((r) => (
          <li key={r.id} className="rounded bg-white/[0.03] px-2 py-1.5 text-[9px] text-slate-400">
            {r.name} · {r.boneCount} bones · IK {r.ikEnabled ? "on" : "off"}
          </li>
        ))}
        {rigs.length === 0 ? <li className="text-[9px] text-slate-600">No rigs — create one to begin</li> : null}
      </ul>
    </div>
  );
}
