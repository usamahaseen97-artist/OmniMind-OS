import type {
  LyricsSyncDocument,
  PerformanceMonitorState,
  SmartRecordingState,
  VocalAssistantSuggestion,
  VocalProcessingChain,
  VocalRecordingMode,
  VocalStudioPanel,
  VoiceAnalysisReport,
  VoiceProfile,
  VocalPreset,
  VocalTake,
} from "./vocal-types";

export type OmniMusicVocalContextSlice = {
  vocalPanel: VocalStudioPanel;
  setVocalPanel: (panel: VocalStudioPanel) => void;
  smartRecording: SmartRecordingState;
  updateSmartRecording: (patch: Partial<SmartRecordingState>) => void;
  setRecordingMode: (mode: VocalRecordingMode) => void;
  addSessionMarker: (beat: number, label: string, note?: string) => void;
  vocalTakes: VocalTake[];
  recordVocalTake: (trackId: string) => void;
  starTake: (id: string) => void;
  compTake: (id: string) => void;
  deleteTake: (id: string) => void;
  voiceAnalysis: VoiceAnalysisReport | null;
  analyzeTake: (takeId: string) => void;
  processingChain: VocalProcessingChain;
  updateProcessingChain: (patch: Partial<VocalProcessingChain>) => void;
  applyAutoTune: () => void;
  applyVoiceClean: () => void;
  applyDeEss: () => void;
  applyDoubleTrack: () => void;
  applyHarmony: () => void;
  voiceProfiles: VoiceProfile[];
  authorizeVoiceProfile: (profileId: string, consentId: string) => void;
  canUseVoiceProfile: (profileId: string) => { allowed: boolean; reason: string };
  vocalPresets: VocalPreset[];
  applyVocalPreset: (preset: VocalPreset) => void;
  lyricsSync: LyricsSyncDocument;
  toggleKaraoke: () => void;
  addLyricLine: (text: string, startBeat: number, durationBeats: number) => void;
  pronunciationGuide: (word: string) => { word: string; phonetic: string; syllables: string[] };
  performanceMonitor: PerformanceMonitorState;
  vocalSuggestions: VocalAssistantSuggestion[];
  choirLayers: string[];
};
