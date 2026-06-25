"use client";

import type { InputSource } from "../../../lib/omnimusic-studio/audio-types";
import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

const INPUTS: { id: InputSource; label: string }[] = [
  { id: "mic", label: "Mic" },
  { id: "line", label: "Line" },
  { id: "usb", label: "USB" },
  { id: "bluetooth", label: "BT" },
  { id: "midi", label: "MIDI" },
];

export function RecordingEnginePanel() {
  const {
    recording,
    updateRecording,
    setInputSource,
    toggleRecord,
    transport,
    recording: rec,
    tracks,
    armTrack,
    setTrackMonitor,
    setTrackRecordEnabled,
    selectedTrackId,
  } = useOmniMusicStudio();

  const track = tracks.find((t) => t.id === selectedTrackId);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {INPUTS.map((i) => (
          <button
            key={i.id}
            type="button"
            onClick={() => setInputSource(i.id)}
            className={`rounded px-2 py-0.5 text-[8px] ${recording.input === i.id ? "bg-pink-500/15 text-pink-200" : "text-slate-600"}`}
          >
            {i.label}
          </button>
        ))}
      </div>
      {track?.kind === "audio" ? (
        <div className="flex flex-wrap gap-2 text-[8px]">
          <label className="flex items-center gap-1 text-slate-500">
            <input type="checkbox" checked={track.armed} onChange={() => armTrack(track.id)} /> Arm
          </label>
          <label className="flex items-center gap-1 text-slate-500">
            <input type="checkbox" checked={track.monitorInput} onChange={(e) => setTrackMonitor(track.id, e.target.checked)} /> Monitor
          </label>
          <label className="flex items-center gap-1 text-slate-500">
            <input type="checkbox" checked={track.recordEnabled} onChange={(e) => setTrackRecordEnabled(track.id, e.target.checked)} /> Record
          </label>
        </div>
      ) : null}
      <div className="flex gap-2 text-[8px] text-slate-500">
        <label className="flex items-center gap-1">
          Count-in
          <input
            type="number"
            min={0}
            max={8}
            className="w-8 rounded bg-black/40 px-1"
            value={recording.countIn}
            onChange={(e) => updateRecording({ countIn: Number(e.target.value) })}
          />
        </label>
        <label className="flex items-center gap-1">
          Punch in
          <input
            type="number"
            className="w-10 rounded bg-black/40 px-1"
            value={recording.punchIn ?? ""}
            onChange={(e) => updateRecording({ punchIn: e.target.value ? Number(e.target.value) : null })}
          />
        </label>
        <label className="flex items-center gap-1">
          Punch out
          <input
            type="number"
            className="w-10 rounded bg-black/40 px-1"
            value={recording.punchOut ?? ""}
            onChange={(e) => updateRecording({ punchOut: e.target.value ? Number(e.target.value) : null })}
          />
        </label>
      </div>
      <button
        type="button"
        onClick={() => void toggleRecord()}
        className={`w-full rounded py-1 text-[9px] ${transport.recording || rec.active ? "bg-rose-500/20 text-rose-300" : "bg-white/5 text-slate-400"}`}
      >
        {rec.countInRemaining > 0 ? `Count-in ${rec.countInRemaining}` : transport.recording || rec.active ? "Stop Recording" : "Start Recording"}
      </button>
      {recording.takes.length > 0 ? (
        <ul className="max-h-16 overflow-y-auto text-[8px] text-slate-500">
          {recording.takes.map((t) => (
            <li key={t.id}>{t.name} · {t.durationBeats.toFixed(1)} beats</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
