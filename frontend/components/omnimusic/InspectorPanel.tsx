"use client";

import { AudioEditor } from "./AudioEditor";
import { MidiEditor } from "./MidiEditor";
import { RecordingPanel } from "./RecordingPanel";
import { PluginRack } from "./PluginRack";
import { ClipLauncher } from "./ClipLauncher";
import { AutomationEditor } from "./AutomationEditor";
import { EffectsBrowser } from "./EffectsBrowser";
import { ExportCenter } from "./ExportCenter";
import { AudioSession } from "./audio/AudioSession";
import { AudioDeviceManager } from "./audio/AudioDeviceManager";
import { ProjectRecovery } from "./audio/ProjectRecovery";
import { TransportEnginePanel } from "./audio/TransportEngine";
import { useOmniMusicStudio } from "../../lib/omnimusic-studio-context";

export function InspectorPanel() {
  const { selectedTrackId, tracks, armTrack } = useOmniMusicStudio();
  const track = tracks.find((t) => t.id === selectedTrackId);

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <p className="shrink-0 border-b border-white/[0.06] px-2 py-1.5 text-[9px] font-semibold uppercase text-slate-500">Inspector</p>
      <ProjectRecovery />
      {track ? (
        <div className="border-b border-white/[0.04] p-2">
          <p className="text-[10px] text-pink-200">{track.name}</p>
          <p className="text-[8px] text-slate-600">{track.kind}</p>
          <button type="button" onClick={() => armTrack(track.id)} className="mt-1 text-[8px] text-pink-400">
            {track.armed ? "Disarm" : "Arm"} Track
          </button>
        </div>
      ) : null}
      <AudioSession />
      <AudioDeviceManager />
      <div className="border-b border-white/[0.04] p-2">
        <p className="mb-1 text-[9px] uppercase text-slate-600">Transport</p>
        <TransportEnginePanel />
      </div>
      <AudioEditor />
      <MidiEditor />
      <RecordingPanel />
      <PluginRack />
      <ClipLauncher />
      <AutomationEditor />
      <EffectsBrowser />
      <ExportCenter />
    </div>
  );
}
