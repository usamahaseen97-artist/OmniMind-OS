"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function RemoteRecording() {
  const { remoteGuests, inviteRemoteGuest, connectRemoteGuest, activeEpisode, addPodcastTrack } = useOmniMusicStudio();

  return (
    <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[9px] font-medium text-slate-300">Remote Guests · Riverside-style</p>
        <button type="button" onClick={() => inviteRemoteGuest("Guest", `guest${remoteGuests.length + 1}@example.com`)} className="text-[8px] text-emerald-400">Invite</button>
      </div>
      <ul className="space-y-1">
        {remoteGuests.map((g) => (
          <li key={g.id} className="flex items-center justify-between rounded border border-white/[0.04] px-2 py-1 text-[8px]">
            <span className="text-slate-400">{g.name}</span>
            <span className={g.status === "connected" ? "text-emerald-400" : "text-slate-600"}>{g.status}</span>
            {g.status !== "connected" ? <button type="button" onClick={() => connectRemoteGuest(g.id)} className="text-emerald-400">Connect</button> : <span className="text-slate-700">{g.latencyMs}ms</span>}
          </li>
        ))}
      </ul>
      {activeEpisode ? (
        <button type="button" onClick={() => addPodcastTrack(activeEpisode.id, "Remote Track", "remote-guest")} className="mt-2 text-[8px] text-slate-500">+ Remote track</button>
      ) : null}
    </div>
  );
}
