"use client";

export function MultibandCompressor() {
  return (
    <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
      <p className="mb-2 text-[9px] font-medium text-slate-300">Multiband Compressor · Transient Designer</p>
      {["Low", "Mid", "High"].map((band) => (
        <label key={band} className="mb-1 flex items-center gap-2 text-[8px] text-slate-500">
          <span className="w-16">{band}</span>
          <input type="range" min={-40} max={0} defaultValue={-14} className="flex-1" />
        </label>
      ))}
    </div>
  );
}
