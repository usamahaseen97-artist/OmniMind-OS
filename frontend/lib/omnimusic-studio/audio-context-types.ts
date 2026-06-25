import type { Dispatch, SetStateAction } from "react";
import type {
  AudioDeviceInfo,
  AudioRegion,
  AudioSettings,
  ExtendedTransportState,
  InputSource,
  ProjectRecoverySnapshot,
  RecordingSessionState,
  TimeDisplayMode,
  WaveformData,
  WaveformEditOp,
  WaveformSelection,
  WaveformViewState,
} from "./audio-types";
import type { OmniMusicProject, TimelineClip } from "./types";

export type OmniMusicAudioContextSlice = {
  audioReady: boolean;
  audioSettings: AudioSettings;
  audioDevices: AudioDeviceInfo[];
  refreshDevices: () => Promise<void>;
  updateAudioSettings: (patch: Partial<AudioSettings>) => void;
  transport: ExtendedTransportState;
  setTransport: Dispatch<SetStateAction<ExtendedTransportState>>;
  play: () => void;
  pause: () => void;
  stop: () => void;
  togglePlayPause: () => void;
  toggleRecord: () => void;
  rewind: (beats?: number) => void;
  fastForward: (beats?: number) => void;
  frameStep: (direction: 1 | -1) => void;
  setPlayhead: (beat: number) => void;
  setTempo: (tempo: number) => void;
  setTimeSignature: (sig: [number, number]) => void;
  setDisplayMode: (mode: TimeDisplayMode) => void;
  setPlaybackSpeed: (speed: number) => void;
  setCycleRegion: (start: number, end: number) => void;
  clearCycleRegion: () => void;
  setLocator: (left: number | null, right: number | null) => void;
  recording: RecordingSessionState;
  updateRecording: (patch: Partial<RecordingSessionState>) => void;
  setInputSource: (input: InputSource) => void;
  armTrack: (trackId: string, armed?: boolean) => void;
  setTrackMonitor: (trackId: string, on: boolean) => void;
  setTrackRecordEnabled: (trackId: string, on: boolean) => void;
  waveforms: Record<string, WaveformData>;
  selectedClipId: string | null;
  setSelectedClipId: (id: string | null) => void;
  waveformView: WaveformViewState;
  setWaveformZoom: (zoom: number) => void;
  setWaveformSelection: (sel: WaveformSelection) => void;
  applyWaveformEdit: (op: WaveformEditOp) => void;
  addRegion: (region: Omit<AudioRegion, "id">) => void;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  undoLabels: string[];
  recoverySnapshots: ProjectRecoverySnapshot[];
  restoreSnapshot: (id: string) => void;
  saveRecoverySnapshot: (reason?: ProjectRecoverySnapshot["reason"]) => void;
  formatTime: (beat?: number) => string;
};

// Re-export for consumers that import types from bridge
export type { OmniMusicProject, TimelineClip };
