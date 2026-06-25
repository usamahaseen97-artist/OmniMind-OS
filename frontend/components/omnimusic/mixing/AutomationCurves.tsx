"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function AutomationCurves() {
  const { automationLanes, selectedMixChannelId, addAutomationLane, addAutomationPoint } = useOmniMusicStudio();

  return (
    <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[9px] font-medium text-slate-300">Automation · Bezier curves</p>
        <button
          type="button"
          disabled={!selectedMixChannelId}
          onClick={() => selectedMixChannelId && addAutomationLane(selectedMixChannelId, "volume")}
          className="text-[8px] text-amber-400 disabled:opacity-40"
        >
          + Volume lane
        </button>
      </div>
      <ul className="space-y-2">
        {automationLanes.map((lane) => (
          <li key={lane.id} className="rounded border border-white/[0.04] p-2 text-[8px]">
            <div className="mb-1 flex justify-between text-slate-500">
              <span>{lane.param} · {lane.targetId}</span>
              <button type="button" onClick={() => addAutomationPoint(lane.id, lane.points.length, 0.8)} className="text-amber-400">+ Point</button>
            </div>
            <div className="relative h-12 rounded bg-black/30">
              {lane.points.map((pt) => (
                <div key={pt.id} className="absolute bottom-0 h-2 w-2 -translate-x-1/2 rounded-full bg-amber-400" style={{ left: `${(pt.beat % 16) / 16 * 100}%`, bottom: `${pt.value * 100}%` }} />
              ))}
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[7px] text-slate-700">Track · master · plugin · send · tempo automation</p>
    </div>
  );
}
