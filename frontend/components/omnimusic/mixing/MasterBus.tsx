"use client";

import type { MixBus } from "../../../lib/omnimusic-studio/mixing-types";

type Props = {
  bus: MixBus;
  onUpdate: (patch: Partial<MixBus>) => void;
};

export function MasterBus({ bus, onUpdate }: Props) {
  return (
    <div className="mx-0.5 flex w-16 shrink-0 flex-col items-center rounded border border-amber-500/30 bg-amber-500/5 p-1">
      <span className="mb-1 text-[7px] font-medium text-amber-200">{bus.name}</span>
      <span className="mb-1 text-[6px] uppercase text-amber-500/60">{bus.kind}</span>
      <input type="range" min={0} max={1} step={0.01} value={bus.gain} onChange={(e) => onUpdate({ gain: Number(e.target.value) })} className="h-16 w-full [writing-mode:vertical-lr]" />
      <input type="range" min={-1} max={1} step={0.01} value={bus.pan} onChange={(e) => onUpdate({ pan: Number(e.target.value) })} className="mt-1 w-full" />
      <div className="mt-1 flex gap-0.5">
        <button type="button" onClick={() => onUpdate({ muted: !bus.muted })} className="text-[7px] text-slate-600">M</button>
        <button type="button" onClick={() => onUpdate({ solo: !bus.solo })} className="text-[7px] text-slate-600">S</button>
      </div>
    </div>
  );
}
