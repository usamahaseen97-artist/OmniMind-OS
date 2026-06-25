"use client";

export function LimiterStudio() {
  return (
    <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
      <p className="mb-2 text-[9px] font-medium text-slate-300">Limiter</p>
      <label className="mb-1 flex items-center gap-2 text-[8px] text-slate-500"><span className="w-16">Ceiling</span><input type="range" min={-12} max={0} step={0.1} defaultValue={-0.3} className="flex-1" /></label>
      <label className="mb-1 flex items-center gap-2 text-[8px] text-slate-500"><span className="w-16">Release</span><input type="range" min={1} max={500} step={1} defaultValue={50} className="flex-1" /></label>
    </div>
  );
}
