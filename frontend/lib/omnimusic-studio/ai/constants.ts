import type { BeatTemplate, GenerationWorkflowKind, MusicProviderId, MusicTemplate } from "../ai-types";

export const MUSIC_PROVIDER_DESCRIPTORS: {
  id: MusicProviderId;
  label: string;
  workflows: GenerationWorkflowKind[];
}[] = [
  {
    id: "openai",
    label: "OpenAI",
    workflows: ["text-to-music", "lyrics-to-song", "prompt-to-instrumental", "prompt-to-jingle"],
  },
  {
    id: "google",
    label: "Google",
    workflows: ["text-to-music", "prompt-to-background", "prompt-to-cinematic"],
  },
  {
    id: "local",
    label: "Local Models",
    workflows: ["prompt-to-beat", "melody-to-arrangement", "chords-to-song"],
  },
  {
    id: "omnimusic-future",
    label: "OmniMusic Models",
    workflows: [
      "text-to-music",
      "lyrics-to-song",
      "prompt-to-beat",
      "prompt-to-trailer",
      "prompt-to-game",
      "prompt-to-podcast",
    ],
  },
];

export const GENRES = [
  "Hip Hop",
  "Trap",
  "Lo-Fi",
  "Pop",
  "Rock",
  "EDM",
  "House",
  "Techno",
  "Drill",
  "Afro",
  "Latin",
  "Classical",
  "Jazz",
  "Ambient",
  "Orchestral",
  "Custom",
] as const;

export const MOODS = [
  "Energetic",
  "Chill",
  "Dark",
  "Uplifting",
  "Melancholic",
  "Aggressive",
  "Dreamy",
  "Cinematic",
  "Romantic",
  "Epic",
] as const;

export const EMOTIONS = ["Joy", "Sadness", "Tension", "Hope", "Anger", "Peace", "Nostalgia", "Triumph"] as const;

export const STYLES = [
  "Modern",
  "Vintage",
  "Minimal",
  "Layered",
  "Acoustic",
  "Electronic",
  "Hybrid",
  "Experimental",
] as const;

export const SCALES = [
  "Major",
  "Minor",
  "Dorian",
  "Mixolydian",
  "Pentatonic",
  "Blues",
  "Chromatic",
] as const;

export const KEYS = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

export const SONG_STRUCTURES = [
  "Intro-Verse-Chorus-Verse-Chorus-Bridge-Chorus-Outro",
  "Verse-Chorus-Verse-Chorus",
  "AABA",
  "Loop",
  "Through-composed",
  "EDM Drop",
] as const;

export const WORKFLOW_LABELS: Record<GenerationWorkflowKind, string> = {
  "text-to-music": "Text → Music",
  "lyrics-to-song": "Lyrics → Song",
  "melody-to-arrangement": "Melody → Arrangement",
  "chords-to-song": "Chords → Full Song",
  "prompt-to-beat": "Prompt → Beat",
  "prompt-to-instrumental": "Prompt → Instrumental",
  "prompt-to-background": "Prompt → Background Music",
  "prompt-to-intro": "Prompt → Intro",
  "prompt-to-outro": "Prompt → Outro",
  "prompt-to-trailer": "Prompt → Trailer Music",
  "prompt-to-cinematic": "Prompt → Cinematic Score",
  "prompt-to-game": "Prompt → Game Music",
  "prompt-to-podcast": "Prompt → Podcast Intro",
  "prompt-to-jingle": "Prompt → Jingle",
};

export const BEAT_TEMPLATES: BeatTemplate[] = GENRES.filter((g) => g !== "Custom").map((genre, i) => ({
  id: `beat-${genre.toLowerCase().replace(/\s+/g, "-")}`,
  name: `${genre} Starter`,
  genre,
  bpm: [90, 140, 85, 120, 110, 128, 124, 130, 145, 105, 118, 90, 100, 70, 90][i] ?? 120,
  key: KEYS[i % KEYS.length]!,
  pattern: `${genre} kick-snare-hat`,
}));

export const MUSIC_TEMPLATES: MusicTemplate[] = [
  {
    id: "tpl-trap-dark",
    name: "Dark Trap",
    genre: "Trap",
    workflow: "prompt-to-beat",
    promptDefaults: { mood: "Dark", bpm: 140, energy: 80 },
  },
  {
    id: "tpl-lofi-study",
    name: "Lo-Fi Study",
    genre: "Lo-Fi",
    workflow: "prompt-to-instrumental",
    promptDefaults: { mood: "Chill", bpm: 85, energy: 30 },
  },
  {
    id: "tpl-cinematic-trailer",
    name: "Trailer Score",
    genre: "Orchestral",
    workflow: "prompt-to-trailer",
    promptDefaults: { mood: "Epic", energy: 95, durationSec: 60 },
  },
  {
    id: "tpl-podcast-intro",
    name: "Podcast Intro",
    genre: "Pop",
    workflow: "prompt-to-podcast",
    promptDefaults: { durationSec: 15, energy: 60 },
  },
];

export const LANGUAGES = ["English", "Spanish", "French", "Portuguese", "Korean", "Japanese", "Arabic", "Hindi"] as const;

export const DEFAULT_PROMPT: Omit<import("../ai-types").MusicPromptSpec, "id"> = {
  prompt: "",
  negativePrompt: "",
  genre: "Pop",
  mood: "Uplifting",
  emotion: "Joy",
  language: "English",
  tempo: 120,
  bpm: 120,
  key: "C",
  scale: "Major",
  durationSec: 180,
  songStructure: SONG_STRUCTURES[0]!,
  energy: 70,
  instruments: ["Drums", "Bass", "Synth"],
  referenceTrackId: null,
  creativity: 65,
  seed: null,
  workflow: "text-to-music",
  advanced: {},
};
