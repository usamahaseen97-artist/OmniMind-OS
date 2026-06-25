"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function RecordingWorkspace() {
  const {
    smartRecording,
    updateSmartRecording,
    setRecordingMode,
    selectedTrackId,
    recordVocalTake,
    transport,
    addSessionMarker,
  } = useOmniMusicStudio();

  return (
    <div className="mb-3 space-y-2">
      <p className="text-[9px] uppercase text-cyan-400/80">Smart Recording</p>
      <div className="flex flex-wrap gap-1">
        {(["live", "multi-take", "loop", "punch"] as const).map((m) => (
          <button key={m} type="button" onClick={() => setRecordingMode(m)} className={`rounded px-2 py-0.5 text-[8px] capitalize ${smartRecording.mode === m ? "bg-cyan-500/15 text-cyan-200" : "text-slate-600"}`}>{m}</button>
        ))}
      </div>
      <div className="flex gap-2 text-[8px]">
        <label className="text-slate-500">Punch in <input type="number" className="w-10 rounded bg-black/40 px-1" value={smartRecording.punchIn ?? ""} onChange={(e) => updateSmartRecording({ punchIn: e.target.value ? Number(e.target.value) : null })} /></label>
        <label className="text-slate-500">Punch out <input type="number" className="w-10 rounded bg-black/40 px-1" value={smartRecording.punchOut ?? ""} onChange={(e) => updateSmartRecording({ punchOut: e.target.value ? Number(e.target.value) : null })} /></label>
        <label className="flex items-center gap-1 text-slate-500"><input type="checkbox" checked={smartRecording.loopEnabled} onChange={(e) => updateSmartRecording({ loopEnabled: e.target.checked })} />Loop</label>
      </div>
      <textarea className="h-12 w-full rounded bg-black/40 p-1 text-[8px]" placeholder="Session notes" value={smartRecording.sessionNotes} onChange={(e) => updateSmartRecording({ sessionNotes: e.target.value })} />
      <button type="button" disabled={!selectedTrackId} onClick={() => selectedTrackId && recordVocalTake(selectedTrackId)} className="w-full rounded bg-cyan-500/15 py-1 text-[9px] text-cyan-200 disabled:opacity-40">Record Vocal Take</button>
      <button type="button" onClick={() => addSessionMarker(transport.playheadBeat, "Vocal marker")} className="text-[8px] text-slate-500">Add marker at playhead</button>
    </div>
  );
}
