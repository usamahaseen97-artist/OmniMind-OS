"use client";

import { Eye, EyeOff, Lock, Trash2, Volume2, VolumeX } from "lucide-react";
import { EDITOR_TRACK_COLORS } from "../../../lib/visionary/editor/constants";
import { useVisionaryEditor } from "../../../lib/visionary/editor-context";

/** Track header column — mute, solo, lock, visibility. */
export function TrackManager() {
  const { project, removeTrack } = useVisionaryEditor();

  return (
    <div className="w-36 shrink-0 overflow-y-auto border-r border-white/[0.04] bg-[#080c12]">
      <div className="h-6 border-b border-white/[0.04]" />
      {project.tracks.map((track) => (
        <div
          key={track.id}
          className="flex items-center gap-0.5 border-b border-white/[0.03] px-1"
          style={{ height: track.height }}
        >
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: EDITOR_TRACK_COLORS[track.type] }}
          />
          <span className="min-w-0 flex-1 truncate text-[9px] text-slate-400">{track.label}</span>
          {track.muted ? <VolumeX size={9} className="text-slate-600" /> : <Volume2 size={9} className="text-slate-600" />}
          {track.visible ? <Eye size={9} className="text-slate-600" /> : <EyeOff size={9} />}
          {track.locked ? <Lock size={9} className="text-amber-500/70" /> : null}
          <button
            type="button"
            onClick={() => removeTrack(track.id)}
            className="p-0.5 text-slate-600 hover:text-rose-400"
            title="Remove track"
          >
            <Trash2 size={9} />
          </button>
        </div>
      ))}
    </div>
  );
}

/** Clip operations — inspector clip tab. */
export function ClipManager() {
  const { selectedClip, splitAtPlayhead, deleteSelectedClip, joinSelectedWithNext } = useVisionaryEditor();

  if (!selectedClip) {
    return <p className="p-3 text-[10px] text-slate-600">Select a clip on the timeline</p>;
  }

  return (
    <div className="space-y-2 p-3 text-[10px]">
      <p className="font-medium text-slate-200">{selectedClip.label}</p>
      <p className="text-slate-500">Start {selectedClip.startFrame} · Dur {selectedClip.durationFrames}f</p>
      <div className="flex flex-wrap gap-1 pt-2">
        <button type="button" onClick={splitAtPlayhead} className="rounded border border-white/10 px-2 py-1 text-[9px] hover:bg-white/5">Split</button>
        <button type="button" onClick={joinSelectedWithNext} className="rounded border border-white/10 px-2 py-1 text-[9px] hover:bg-white/5">Join</button>
        <button type="button" onClick={deleteSelectedClip} className="rounded border border-rose-500/30 px-2 py-1 text-[9px] text-rose-300">Delete</button>
      </div>
    </div>
  );
}
