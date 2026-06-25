/** OmniMusic Studio — Audio Engine types (Phase 2). */

import type { OmniMusicProject, TimelineClip } from "./types";

export type InputSource = "mic" | "line" | "usb" | "bluetooth" | "midi";

export type AudioDeviceTransport = "builtin" | "usb" | "bluetooth" | "virtual";

export type AudioDeviceInfo = {
  deviceId: string;
  label: string;
  kind: "audioinput" | "audiooutput";
  transport: AudioDeviceTransport;
};

export type AudioSettings = {
  inputDeviceId: string | null;
  outputDeviceId: string | null;
  sampleRate: 44100 | 48000 | 96000;
  bitDepth: 16 | 24 | 32;
  bufferSize: 128 | 256 | 512 | 1024 | 2048;
  clockSource: "internal" | "external" | "wordclock";
};

export type TimeDisplayMode = "bars" | "beats" | "samples" | "frames";

export type TransportStatus = "stopped" | "playing" | "paused" | "recording";

export type ExtendedTransportState = {
  status: TransportStatus;
  playing: boolean;
  paused: boolean;
  recording: boolean;
  loopEnabled: boolean;
  loopStart: number;
  loopEnd: number;
  tempo: number;
  timeSignature: [number, number];
  playheadBeat: number;
  playbackSpeed: number;
  displayMode: TimeDisplayMode;
  locatorLeft: number | null;
  locatorRight: number | null;
  cycleRegion: { startBeat: number; endBeat: number } | null;
  sampleRate: number;
};

export type RecordingTake = {
  id: string;
  trackId: string;
  clipId: string;
  name: string;
  startedAt: string;
  durationBeats: number;
  waveformId: string;
  selected: boolean;
};

export type RecordingSessionState = {
  active: boolean;
  sessionId: string | null;
  armedTrackIds: string[];
  input: InputSource;
  monitorInput: boolean;
  recordEnabled: boolean;
  punchIn: number | null;
  punchOut: number | null;
  countIn: number;
  countInRemaining: number;
  metronome: boolean;
  latencyMs: number;
  takes: RecordingTake[];
};

export type WaveformData = {
  id: string;
  clipId: string;
  peaks: number[];
  sampleRate: number;
  durationSec: number;
  channels: number;
  normalized: boolean;
};

export type AudioRegion = {
  id: string;
  clipId: string;
  startSample: number;
  endSample: number;
  label: string;
  color: string;
};

export type WaveformSelection = {
  clipId: string;
  startSample: number;
  endSample: number;
} | null;

export type WaveformEditOp =
  | "split"
  | "trim"
  | "fadeIn"
  | "fadeOut"
  | "normalize"
  | "reverse"
  | "duplicate"
  | "silence"
  | "move";

export type WaveformViewState = {
  zoom: number;
  snapEnabled: boolean;
  snapDivision: number;
  selection: WaveformSelection;
  regions: AudioRegion[];
};

export type UndoEntry = {
  id: string;
  label: string;
  timestamp: string;
  project: OmniMusicProject;
  waveforms: Record<string, WaveformData>;
  clips: TimelineClip[];
};

export type ProjectRecoverySnapshot = {
  id: string;
  projectId: string;
  savedAt: string;
  reason: "autosave" | "manual" | "crash";
  label: string;
  project: OmniMusicProject;
};

export type AudioClipMetadata = {
  clipId: string;
  waveformId: string;
  sampleRate: number;
  bitDepth: number;
  channels: number;
  durationSec: number;
  peakDb: number;
};

export type TransportPersistence = {
  projectId: string;
  transport: ExtendedTransportState;
  savedAt: string;
};
