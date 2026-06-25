"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  mixerEngine,
  pluginManagerEngine,
  trackManagerEngine,
  omnimusicStudioApi,
  audioSessionCoordinator,
  SEED_TRACKS,
  BROWSER_SEED,
} from "./omnimusic-studio";
import { useOmniMusicAudioBridge } from "./omnimusic-studio/use-audio-bridge";
import { useOmniMusicAIBridge } from "./omnimusic-studio/use-ai-bridge";
import { useOmniMusicVocalBridge } from "./omnimusic-studio/use-vocal-bridge";
import { useOmniMusicMixingBridge } from "./omnimusic-studio/use-mixing-bridge";
import { useOmniMusicBroadcastBridge } from "./omnimusic-studio/use-broadcast-bridge";
import type { OmniMusicAudioContextSlice } from "./omnimusic-studio/audio-context-types";
import type { OmniMusicAIContextSlice } from "./omnimusic-studio/ai-context-types";
import type { OmniMusicVocalContextSlice } from "./omnimusic-studio/vocal-context-types";
import type { OmniMusicMixingContextSlice } from "./omnimusic-studio/mixing-context-types";
import type { OmniMusicBroadcastContextSlice } from "./omnimusic-studio/broadcast-context-types";
import type { StudioViewMode } from "./omnimusic-studio/ai-types";
import type {
  AutomationPoint,
  BrowserItem,
  BrowserTab,
  DawPlugin,
  DawTrack,
  ExportJob,
  MidiNote,
  MixerChannel,
  OmniMusicProject,
  TimelineClip,
  TimelineMarker,
  TrackKind,
} from "./omnimusic-studio/types";

function buildSeedProject(): OmniMusicProject {
  const tracks: DawTrack[] = SEED_TRACKS.map((t) => ({
    ...t,
    muted: false,
    solo: false,
    armed: t.kind === "audio",
    monitorInput: false,
    recordEnabled: t.kind === "audio" || t.kind === "instrument",
    volume: t.kind === "master" ? 1 : 0.8,
    pan: 0,
    parentId: null,
    fxSlotIds: [],
    sendLevels: {},
  }));
  const clips: TimelineClip[] = [
    { id: "c1", trackId: "tr-drums", name: "Drum Pattern", startBeat: 0, durationBeats: 16, color: "#f472b6", loop: true, waveformId: "wf-c1" },
    { id: "c2", trackId: "tr-bass", name: "Bass Line", startBeat: 0, durationBeats: 16, color: "#a78bfa", loop: true, waveformId: "wf-c2" },
    { id: "c3", trackId: "tr-pad", name: "Pad Chords", startBeat: 4, durationBeats: 12, color: "#c084fc", loop: false, waveformId: "wf-c3" },
    { id: "c4", trackId: "tr-vox", name: "Vocal Comp", startBeat: 0, durationBeats: 8, color: "#38bdf8", loop: false, waveformId: "wf-c4" },
  ];
  const mixer: MixerChannel[] = tracks.map((t) => ({
    id: `mix-${t.id}`,
    trackId: t.id,
    name: t.name,
    gain: t.volume,
    pan: t.pan,
    muted: t.muted,
    solo: t.solo,
    peakL: 0.2,
    peakR: 0.2,
    fxSlots: [],
    sends: t.kind === "audio" ? [{ busId: "tr-fx", level: 0.3 }] : [],
  }));
  return {
    id: "daw-proj-001",
    name: "Untitled Session",
    tracks,
    clips,
    markers: [{ id: "mk1", beat: 0, label: "Intro" }, { id: "mk2", beat: 16, label: "Drop" }],
    mixer,
    tempo: 120,
    timeSignature: [4, 4],
    modifiedAt: new Date().toISOString(),
    version: 1,
  };
}

export type OmniMusicStudioContextValue = OmniMusicAudioContextSlice &
  OmniMusicAIContextSlice &
  OmniMusicVocalContextSlice &
  OmniMusicMixingContextSlice &
  OmniMusicBroadcastContextSlice & {
  studioViewMode: StudioViewMode;
  setStudioViewMode: (mode: StudioViewMode) => void;
  project: OmniMusicProject;
  tracks: DawTrack[];
  addTrack: (kind: TrackKind, name: string) => void;
  updateTrack: (id: string, patch: Partial<DawTrack>) => void;
  clips: TimelineClip[];
  addClip: (trackId: string, name: string) => void;
  markers: TimelineMarker[];
  selectedTrackId: string | null;
  setSelectedTrackId: (id: string | null) => void;
  mixer: MixerChannel[];
  updateMixer: (id: string, patch: Partial<MixerChannel>) => void;
  midiNotes: MidiNote[];
  addMidiNote: (pitch: number, start: number, dur: number, vel: number) => void;
  browserTab: BrowserTab;
  setBrowserTab: (t: BrowserTab) => void;
  browserItems: BrowserItem[];
  plugins: DawPlugin[];
  scanPlugins: () => void;
  installPlugin: (id: string) => void;
  automation: AutomationPoint[];
  exportJobs: ExportJob[];
  queueExport: (format: ExportJob["format"]) => void;
  saveProject: () => void;
};

const OmniMusicStudioContext = createContext<OmniMusicStudioContextValue | null>(null);

export function OmniMusicStudioProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<OmniMusicProject>(buildSeedProject);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>("tr-drums");
  const [midiNotes, setMidiNotes] = useState<MidiNote[]>([
    { id: "n1", pitch: 60, startBeat: 0, durationBeats: 1, velocity: 100 },
    { id: "n2", pitch: 64, startBeat: 1, durationBeats: 1, velocity: 90 },
    { id: "n3", pitch: 67, startBeat: 2, durationBeats: 1, velocity: 95 },
  ]);
  const [browserTab, setBrowserTab] = useState<BrowserTab>("samples");
  const [browserItems] = useState<BrowserItem[]>(
    BROWSER_SEED.flatMap((g) =>
      g.items.map((name, i) => ({
        id: `br-${g.tab}-${i}`,
        name,
        category: g.tab,
        bpm: g.tab === "loops" ? 120 : null,
        key: null,
        tags: [g.tab],
      })),
    ),
  );
  const [plugins, setPlugins] = useState<DawPlugin[]>(pluginManagerEngine.seedInternal());
  const [automation] = useState<AutomationPoint[]>([]);
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [studioViewMode, setStudioViewMode] = useState<StudioViewMode>("daw");

  const commit = useCallback((updater: (p: OmniMusicProject) => OmniMusicProject, undoLabel?: string) => {
    setProject((prev) => {
      if (undoLabel) audioSessionCoordinator.snapshotUndo(undoLabel, prev, prev.clips);
      const next = { ...updater(prev), version: prev.version + 1, modifiedAt: new Date().toISOString() };
      void omnimusicStudioApi.saveProject(next).catch(() => undefined);
      return next;
    });
  }, []);

  const audio = useOmniMusicAudioBridge({ project, setProject, commit });
  const ai = useOmniMusicAIBridge({ project });
  const vocal = useOmniMusicVocalBridge({
    project,
    playheadBeat: audio.transport.playheadBeat,
    latencyMs: audio.recording.latencyMs,
  });

  const mixing = useOmniMusicMixingBridge({ project });
  const broadcast = useOmniMusicBroadcastBridge({ project });

  const addTrack = useCallback(
    (kind: TrackKind, name: string) => {
      commit((p) => {
        const tracks = trackManagerEngine.add(p.tracks, kind, name);
        const mixer = mixerEngine.syncFromTracks(p.mixer, tracks);
        return { ...p, tracks, mixer };
      }, "Add track");
    },
    [commit],
  );

  const updateTrack = useCallback(
    (id: string, patch: Partial<DawTrack>) => {
      commit((p) => {
        const tracks = trackManagerEngine.update(p.tracks, id, patch);
        const mixer = mixerEngine.syncFromTracks(p.mixer, tracks);
        return { ...p, tracks, mixer };
      });
    },
    [commit],
  );

  const addClip = useCallback(
    (trackId: string, name: string) => {
      commit((p) => ({
        ...p,
        clips: trackManagerEngine.addClip(p.clips, trackId, name, audio.transport.playheadBeat, 4).map((c, i, arr) =>
          i === arr.length - 1 ? { ...c, waveformId: `wf-${c.id}` } : c,
        ),
      }), "Add clip");
    },
    [commit, audio.transport.playheadBeat],
  );

  const updateMixer = useCallback(
    (id: string, patch: Partial<MixerChannel>) => {
      commit((p) => ({ ...p, mixer: mixerEngine.update(p.mixer, id, patch) }));
    },
    [commit],
  );

  const addMidiNote = useCallback((pitch: number, start: number, dur: number, vel: number) => {
    setMidiNotes((prev) => [...prev, { id: `n-${Date.now()}`, pitch, startBeat: start, durationBeats: dur, velocity: vel }]);
  }, []);

  const scanPlugins = useCallback(() => {
    setPlugins((prev) => pluginManagerEngine.scan(prev));
  }, []);

  const installPlugin = useCallback((id: string) => {
    setPlugins((prev) => pluginManagerEngine.install(prev, id));
  }, []);

  const queueExport = useCallback((format: ExportJob["format"]) => {
    setExportJobs((prev) => [{ id: `exp-${Date.now()}`, format, status: "queued", progress: 0 }, ...prev]);
  }, []);

  const saveProject = useCallback(() => {
    void omnimusicStudioApi.saveProject(project);
    audio.saveRecoverySnapshot("manual");
  }, [project, audio]);

  useEffect(() => {
    void omnimusicStudioApi.loadProject(project.id).catch(() => undefined);
    void omnimusicStudioApi.loadTransport(project.id).then((res) => {
      if (res?.transport) audio.setTransport((t) => ({ ...t, ...res.transport }));
    }).catch(() => undefined);
  }, [project.id]);

  const value = useMemo<OmniMusicStudioContextValue>(
    () => ({
      ...audio,
      ...ai,
      ...vocal,
      ...mixing,
      ...broadcast,
      studioViewMode,
      setStudioViewMode,
      project,
      tracks: project.tracks,
      addTrack,
      updateTrack,
      clips: project.clips,
      addClip,
      markers: project.markers,
      selectedTrackId,
      setSelectedTrackId,
      mixer: project.mixer,
      updateMixer,
      midiNotes,
      addMidiNote,
      browserTab,
      setBrowserTab,
      browserItems,
      plugins,
      scanPlugins,
      installPlugin,
      automation,
      exportJobs,
      queueExport,
      saveProject,
    }),
    [
      audio,
      ai,
      vocal,
      mixing,
      broadcast,
      studioViewMode,
      project,
      addTrack,
      updateTrack,
      addClip,
      selectedTrackId,
      updateMixer,
      midiNotes,
      addMidiNote,
      browserTab,
      browserItems,
      plugins,
      scanPlugins,
      installPlugin,
      automation,
      exportJobs,
      queueExport,
      saveProject,
    ],
  );

  return <OmniMusicStudioContext.Provider value={value}>{children}</OmniMusicStudioContext.Provider>;
}

export function useOmniMusicStudio() {
  const ctx = useContext(OmniMusicStudioContext);
  if (!ctx) throw new Error("useOmniMusicStudio must be used within OmniMusicStudioProvider");
  return ctx;
}
