"use client";

export function ReverbStudio() {
  return (
    <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
      <p className="mb-2 text-[9px] font-medium text-slate-300">Reverb</p>
      <label className="mb-1 flex items-center gap-2 text-[8px] text-slate-500"><span className="w-16">Size</span><input type="range" min={0} max={100} defaultValue={50} className="flex-1" /></label>
      <label className="mb-1 flex items-center gap-2 text-[8px] text-slate-500"><span className="w-16">Decay</span><input type="range" min={0.1} max={10} step={0.1} defaultValue={2.5} className="flex-1" /></label>
    </div>
  );
}
