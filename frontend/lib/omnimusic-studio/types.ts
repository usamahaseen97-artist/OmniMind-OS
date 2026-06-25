/** OmniMusic Studio — Professional DAW types (Phase 1). */

export type BrowserTab =
  | "samples"
  | "loops"
  | "instruments"
  | "projects"
  | "presets"
  | "templates"
  | "favorites"
  | "recent";

export type TrackKind = "audio" | "midi" | "instrument" | "group" | "bus" | "master";

export type DawTrack = {
  id: string;
  name: string;
  kind: TrackKind;
  color: string;
  muted: boolean;
  solo: boolean;
  armed: boolean;
  monitorInput: boolean;
  recordEnabled: boolean;
  volume: number;
  pan: number;
  parentId: string | null;
  fxSlotIds: string[];
  sendLevels: Record<string, number>;
};

export type TimelineClip = {
  id: string;
  trackId: string;
  name: string;
  startBeat: number;
  durationBeats: number;
  color: string;
  loop: boolean;
  waveformId?: string;
  audioClipId?: string;
};

export type TimelineMarker = {
  id: string;
  beat: number;
  label: string;
};

export type MidiNote = {
  id: string;
  pitch: number;
  startBeat: number;
  durationBeats: number;
  velocity: number;
};

export type MixerChannel = {
  id: string;
  trackId: string;
  name: string;
  gain: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  peakL: number;
  peakR: number;
  fxSlots: FxSlot[];
  sends: { busId: string; level: number }[];
};

export type FxSlot = {
  id: string;
  pluginId: string;
  name: string;
  bypassed: boolean;
  preset: string | null;
};

export type PluginFormat = "vst" | "au" | "internal";

export type DawPlugin = {
  id: string;
  name: string;
  vendor: string;
  format: PluginFormat;
  category: string;
  installed: boolean;
  scanned: boolean;
};

export type BrowserItem = {
  id: string;
  name: string;
  category: BrowserTab;
  bpm: number | null;
  key: string | null;
  tags: string[];
};

export type RecordingState = {
  armed: boolean;
  input: "mic" | "line" | "midi";
  punchIn: number | null;
  punchOut: number | null;
  countIn: number;
  metronome: boolean;
  latencyMs: number;
};

export type AutomationPoint = {
  id: string;
  trackId: string;
  param: string;
  beat: number;
  value: number;
};

export type TransportState = {
  playing: boolean;
  recording: boolean;
  loopEnabled: boolean;
  loopStart: number;
  loopEnd: number;
  tempo: number;
  timeSignature: [number, number];
  playheadBeat: number;
};

export type OmniMusicProject = {
  id: string;
  name: string;
  tracks: DawTrack[];
  clips: TimelineClip[];
  markers: TimelineMarker[];
  mixer: MixerChannel[];
  tempo: number;
  timeSignature: [number, number];
  modifiedAt: string;
  version: number;
};

export type ExportJob = {
  id: string;
  format: "wav" | "mp3" | "flac" | "stems";
  status: "queued" | "rendering" | "completed" | "failed";
  progress: number;
};
