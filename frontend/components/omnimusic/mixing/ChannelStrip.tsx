"use client";

import { cn } from "../../../lib/utils";
import type { MixChannelStrip as MixChannelStripType } from "../../../lib/omnimusic-studio/mixing-types";

type Props = {
  channel: MixChannelStripType;
  selected?: boolean;
  onSelect?: () => void;
  onUpdate: (patch: Partial<MixChannelStripType>) => void;
};

export function ChannelStrip({ channel, selected, onSelect, onUpdate }: Props) {
  return (
    <div
      className={cn(
        "mx-0.5 flex w-14 shrink-0 flex-col items-center rounded border p-1",
        selected ? "border-amber-500/40 bg-amber-500/5" : "border-white/[0.06] bg-white/[0.02]",
      )}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect?.()}
    >
      <span className="mb-1 max-w-full truncate text-[7px] text-slate-400">{channel.name}</span>
      <div className="mb-1 flex h-10 w-2 flex-col justify-end gap-px bg-black/50">
        <div className="w-full bg-emerald-400/80" style={{ height: `${channel.peakL * 100}%` }} />
        <div className="w-full bg-emerald-600/60" style={{ height: `${channel.rmsL * 80}%` }} />
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={channel.gain}
        onChange={(e) => onUpdate({ gain: Number(e.target.value) })}
        className="h-14 w-full [writing-mode:vertical-lr]"
        onClick={(e) => e.stopPropagation()}
      />
      <input
        type="range"
        min={-1}
        max={1}
        step={0.01}
        value={channel.pan}
        onChange={(e) => onUpdate({ pan: Number(e.target.value) })}
        className="mt-1 w-full"
        onClick={(e) => e.stopPropagation()}
      />
      <div className="mt-1 flex gap-0.5">
        <button type="button" onClick={(e) => { e.stopPropagation(); onUpdate({ muted: !channel.muted }); }} className={cn("text-[7px]", channel.muted ? "text-rose-400" : "text-slate-600")}>M</button>
        <button type="button" onClick={(e) => { e.stopPropagation(); onUpdate({ solo: !channel.solo }); }} className={cn("text-[7px]", channel.solo ? "text-amber-300" : "text-slate-600")}>S</button>
      </div>
      <p className="mt-0.5 text-[6px] text-slate-700">{channel.inserts.length} FX · {channel.sends.length} send</p>
    </div>
  );
}
