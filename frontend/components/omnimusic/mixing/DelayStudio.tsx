"use client";

export function DelayStudio() {
  return (
    <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
      <p className="mb-2 text-[9px] font-medium text-slate-300">Delay · Chorus · Flanger · Phaser</p>
      <label className="mb-1 flex items-center gap-2 text-[8px] text-slate-500"><span className="w-16">Time</span><input type="range" min={1} max={2000} defaultValue={250} className="flex-1" /></label>
      <label className="mb-1 flex items-center gap-2 text-[8px] text-slate-500"><span className="w-16">Feedback</span><input type="range" min={0} max={100} defaultValue={30} className="flex-1" /></label>
    </div>
  );
}
