"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function AudioSession() {
  const { project, recording, transport, recoverySnapshots, saveRecoverySnapshot } = useOmniMusicStudio();

  return (
    <div className="border-b border-white/[0.04] p-2">
      <p className="mb-1 text-[9px] uppercase text-slate-600">Session</p>
      <p className="text-[8px] text-slate-500">{project.name} · v{project.version}</p>
      <p className="text-[8px] text-slate-600">
        {recording.sessionId ? `Recording ${recording.sessionId}` : transport.status} · {recoverySnapshots.length} snapshots
      </p>
      <button type="button" onClick={() => saveRecoverySnapshot("manual")} className="mt-1 text-[8px] text-pink-400">
        Save version snapshot
      </button>
    </div>
  );
}
