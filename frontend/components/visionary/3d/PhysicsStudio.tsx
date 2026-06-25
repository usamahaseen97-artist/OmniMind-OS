"use client";

export function PhysicsStudio() {
  return (
    <div className="flex h-full flex-col p-4">
      <p className="mb-3 text-[10px] font-semibold uppercase text-cyan-400">Physics Studio</p>
      <div className="flex flex-wrap gap-1">
        {["Rigid Body", "Soft Body", "Cloth", "Hair", "Fluid", "Particles"].map((p) => (
          <button key={p} type="button" className="rounded border border-white/[0.06] px-2 py-0.5 text-[8px] text-slate-500">{p}</button>
        ))}
      </div>
      <p className="mt-4 text-[8px] text-slate-600">Collision · Constraints · Simulation bake — stub</p>
    </div>
  );
}
