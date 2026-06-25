"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function RoutingMatrix() {
  const { routingRoutes, mixChannels, mixBuses, connectRoute, toggleRoute } = useOmniMusicStudio();

  return (
    <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
      <p className="mb-2 text-[9px] font-medium text-slate-300">Routing Matrix</p>
      <div className="mb-2 flex flex-wrap gap-1">
        {mixChannels.slice(0, 3).map((ch) => {
          const bus = mixBuses.find((b) => b.kind === "group");
          if (!bus) return null;
          return (
            <button key={ch.id} type="button" onClick={() => connectRoute(ch.id, bus.id)} className="rounded border border-white/[0.06] px-2 py-0.5 text-[7px] text-slate-500">
              {ch.name} → {bus.name}
            </button>
          );
        })}
      </div>
      <ul className="max-h-32 space-y-1 overflow-y-auto">
        {routingRoutes.map((route) => {
          const ch = mixChannels.find((c) => c.id === route.fromChannelId);
          const bus = mixBuses.find((b) => b.id === route.toBusId);
          return (
            <li key={route.id} className="flex items-center justify-between text-[8px]">
              <span className="text-slate-500">{ch?.name ?? route.fromChannelId} → {bus?.name ?? route.toBusId}</span>
              <button type="button" onClick={() => toggleRoute(route.id)} className={route.enabled ? "text-emerald-400" : "text-slate-700"}>
                {route.enabled ? "On" : "Off"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
