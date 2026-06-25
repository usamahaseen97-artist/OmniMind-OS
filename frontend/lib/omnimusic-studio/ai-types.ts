/** OmniMusic Studio — AI Composer types (Phase 3). */

export type MusicProviderId = "openai" | "google" | "local" | "omnimusic-future";

export type MusicProviderStatus = "available" | "unconfigured" | "offline";

export type MusicProviderDescriptor = {
  id: MusicProviderId;
  label: string;
  workflows: GenerationWorkflowKind[];
  status: MusicProviderStatus;
};

export type GenerationWorkflowKind =
  | "text-to-music"
  | "lyrics-to-song"
  | "melody-to-arrangement"
  | "chords-to-song"
  | "prompt-to-beat"
  | "prompt-to-instrumental"
  | "prompt-to-background"
  | "prompt-to-intro"
  | "prompt-to-outro"
  | "prompt-to-trailer"
  | "prompt-to-cinematic"
  | "prompt-to-game"
  | "prompt-to-podcast"
  | "prompt-to-jingle";

export type GenerationJobStatus =
  | "queued"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled";

export type GenerationPriority = "low" | "normal" | "high";

export type MusicPromptSpec = {
  id: string;
  prompt: string;
  negativePrompt: string;
  genre: string;
  mood: string;
  emotion: string;
  language: string;
  tempo: number;
  bpm: number;
  key: string;
  scale: string;
  durationSec: number;
  songStructure: string;
  energy: number;
  instruments: string[];
  referenceTrackId: string | null;
  creativity: number;
  seed: number | null;
  workflow: GenerationWorkflowKind;
  advanced: Record<string, string | number | boolean>;
};

export type GenerationJob = {
  id: string;
  projectId: string;
  promptId: string;
  workflow: GenerationWorkflowKind;
  status: GenerationJobStatus;
  priority: GenerationPriority;
  progress: number;
  estimatedSec: number;
  providerId: MusicProviderId | "auto";
  modelHint: string;
  createdAt: string;
  updatedAt: string;
  error: string | null;
  resultAssetId: string | null;
};

export type LyricSectionKind = "verse" | "chorus" | "bridge" | "hook" | "outro" | "freestyle";

export type LyricSection = {
  id: string;
  kind: LyricSectionKind;
  title: string;
  lines: string[];
  syllableCount: number;
};

export type LyricsDocument = {
  id: string;
  title: string;
  language: string;
  mode: "storytelling" | "rhyme" | "freestyle";
  sections: LyricSection[];
  updatedAt: string;
};

export type MusicAssetKind =
  | "song"
  | "lyrics"
  | "beat"
  | "melody"
  | "chords"
  | "template"
  | "project";

export type MusicAsset = {
  id: string;
  kind: MusicAssetKind;
  name: string;
  genre: string;
  mood: string;
  bpm: number;
  key: string;
  durationSec: number;
  workflow: GenerationWorkflowKind | null;
  favorite: boolean;
  collectionIds: string[];
  createdAt: string;
  metadata: Record<string, string | number>;
};

export type MusicCollection = {
  id: string;
  name: string;
  assetIds: string[];
};

export type BeatTemplate = {
  id: string;
  name: string;
  genre: string;
  bpm: number;
  key: string;
  pattern: string;
};

export type MusicTemplate = {
  id: string;
  name: string;
  genre: string;
  workflow: GenerationWorkflowKind;
  promptDefaults: Partial<MusicPromptSpec>;
};

export type ChordProgression = {
  id: string;
  name: string;
  key: string;
  chords: string[];
  bars: number;
};

export type MelodySketch = {
  id: string;
  name: string;
  key: string;
  scale: string;
  notes: { pitch: number; startBeat: number; durationBeats: number }[];
};

export type AIStudioPanel =
  | "composer"
  | "copilot"
  | "beat"
  | "lyrics"
  | "prompt"
  | "queue"
  | "assets"
  | "templates";

export type StudioViewMode = "daw" | "ai" | "vocal" | "mix" | "broadcast";
