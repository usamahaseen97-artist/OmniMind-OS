import type {
  AIStudioPanel,
  BeatTemplate,
  ChordProgression,
  GenerationJob,
  GenerationPriority,
  LyricsDocument,
  LyricSectionKind,
  MelodySketch,
  MusicAsset,
  MusicPromptSpec,
  MusicProviderDescriptor,
  MusicProviderId,
  MusicTemplate,
  StudioViewMode,
} from "./ai-types";

export type OmniMusicAIContextSlice = {
  aiPanel: AIStudioPanel;
  setAiPanel: (panel: AIStudioPanel) => void;
  prompt: MusicPromptSpec;
  updatePrompt: (patch: Partial<MusicPromptSpec>) => void;
  resetPrompt: () => void;
  promptErrors: string[];
  submitGeneration: (priority?: GenerationPriority) => void;
  generationJobs: GenerationJob[];
  generationHistory: GenerationJob[];
  pauseJob: (id: string) => void;
  resumeJob: (id: string) => void;
  cancelJob: (id: string) => void;
  retryJob: (id: string) => void;
  providers: MusicProviderDescriptor[];
  preferredProvider: MusicProviderId | "auto";
  setPreferredProvider: (id: MusicProviderId | "auto") => void;
  lyrics: LyricsDocument;
  updateLyricsTitle: (title: string) => void;
  addLyricSection: (kind: LyricSectionKind, lines: string[]) => void;
  rhymeSuggestions: (word: string) => string[];
  beatTemplates: BeatTemplate[];
  generateFromBeat: (template: BeatTemplate) => void;
  chordProgressions: ChordProgression[];
  generateChords: () => void;
  melodySketch: MelodySketch | null;
  generateMelody: () => void;
  musicTemplates: MusicTemplate[];
  applyTemplate: (template: MusicTemplate) => void;
  assets: MusicAsset[];
  toggleAssetFavorite: (id: string) => void;
  copilotSuggestions: string[];
};
