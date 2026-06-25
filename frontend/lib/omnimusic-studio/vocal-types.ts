/** OmniMusic Studio — Vocal Production types (Phase 4). */

export type VocalStudioPanel =
  | "record"
  | "analyze"
  | "process"
  | "lyrics"
  | "library"
  | "assistant";

export type VoiceAuthorizationStatus = "pending" | "authorized" | "revoked" | "denied";

/** Legal safety — voice profiles require explicit authorization before use. */
export type VoiceProfile = {
  id: string;
  name: string;
  category: VoiceLibraryCategory;
  gender: "male" | "female" | "neutral" | "child";
  language: string;
  authorizationStatus: VoiceAuthorizationStatus;
  consentRecordId: string | null;
  consentGrantedAt: string | null;
  isThirdParty: boolean;
  providerId: string | null;
  presetId: string | null;
};

export type VoiceLibraryCategory =
  | "lead"
  | "backing"
  | "choir"
  | "children"
  | "male"
  | "female"
  | "narration"
  | "podcast"
  | "audiobook";

export type VocalTake = {
  id: string;
  trackId: string;
  name: string;
  takeNumber: number;
  startBeat: number;
  durationBeats: number;
  waveformId: string | null;
  comped: boolean;
  starred: boolean;
  recordedAt: string;
  notes: string;
};

export type VocalRecordingMode = "live" | "multi-take" | "loop" | "punch";

export type SmartRecordingState = {
  mode: VocalRecordingMode;
  loopEnabled: boolean;
  punchIn: number | null;
  punchOut: number | null;
  activeTakeId: string | null;
  sessionNotes: string;
  trackComments: Record<string, string>;
  markers: { id: string; beat: number; label: string; note: string }[];
};

export type PitchAnalysis = {
  averageHz: number;
  minHz: number;
  maxHz: number;
  centsOff: number;
  confidence: number;
};

export type VoiceAnalysisReport = {
  id: string;
  takeId: string;
  pitch: PitchAnalysis;
  timingMs: number;
  dynamicsDb: number;
  breathingEvents: number;
  pronunciationScore: number;
  energy: number;
  rangeSemitones: number;
  confidence: number;
  analyzedAt: string;
};

export type VocalProcessingChain = {
  autoTune: { enabled: boolean; strength: number; speed: number; formant: number; vibrato: number };
  pitchCorrection: boolean;
  harmony: { enabled: boolean; intervals: number[] };
  doubleTracking: { enabled: boolean; delayMs: number; detuneCents: number; width: number };
  noiseCleanup: { enabled: boolean; amount: number };
  breathReduction: { enabled: boolean; amount: number };
  mouthClickRemoval: boolean;
  deEsser: { enabled: boolean; threshold: number; frequency: number };
  eq: { low: number; mid: number; high: number; air: number };
  compressor: { threshold: number; ratio: number; attack: number; release: number };
  reverb: { mix: number; size: number };
  delay: { mix: number; timeMs: number; feedback: number };
};

export type LyricWordTiming = {
  word: string;
  startBeat: number;
  durationBeats: number;
};

export type LyricLineTiming = {
  id: string;
  text: string;
  startBeat: number;
  durationBeats: number;
  words: LyricWordTiming[];
  language: string;
};

export type LyricsSyncDocument = {
  id: string;
  trackId: string;
  lines: LyricLineTiming[];
  karaokeMode: boolean;
};

export type PronunciationEntry = {
  word: string;
  phonetic: string;
  language: string;
  syllables: string[];
};

export type VocalAssistantSuggestion = {
  id: string;
  category: "recording" | "mic" | "eq" | "compression" | "effects" | "layering";
  title: string;
  detail: string;
  priority: "low" | "medium" | "high";
};

export type VocalPreset = {
  id: string;
  name: string;
  category: VoiceLibraryCategory;
  chain: Partial<VocalProcessingChain>;
  voiceProfileId: string | null;
};

export type PerformanceMonitorState = {
  inputLevel: number;
  peakLevel: number;
  clipping: boolean;
  latencyMs: number;
  cpuPercent: number;
};
