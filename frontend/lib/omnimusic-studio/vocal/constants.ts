import type { VoiceLibraryCategory, VocalPreset } from "../vocal-types";

export const VOICE_LIBRARY_CATEGORIES: { id: VoiceLibraryCategory; label: string }[] = [
  { id: "lead", label: "Lead Vocals" },
  { id: "backing", label: "Backing Vocals" },
  { id: "choir", label: "Choirs" },
  { id: "children", label: "Children" },
  { id: "male", label: "Male" },
  { id: "female", label: "Female" },
  { id: "narration", label: "Narration" },
  { id: "podcast", label: "Podcast" },
  { id: "audiobook", label: "Audiobook" },
];

export const DEFAULT_VOCAL_CHAIN: import("../vocal-types").VocalProcessingChain = {
  autoTune: { enabled: false, strength: 50, speed: 40, formant: 100, vibrato: 30 },
  pitchCorrection: false,
  harmony: { enabled: false, intervals: [3, 5] },
  doubleTracking: { enabled: false, delayMs: 25, detuneCents: 8, width: 70 },
  noiseCleanup: { enabled: true, amount: 30 },
  breathReduction: { enabled: false, amount: 40 },
  mouthClickRemoval: true,
  deEsser: { enabled: true, threshold: -18, frequency: 6500 },
  eq: { low: 0, mid: 0, high: 2, air: 1 },
  compressor: { threshold: -20, ratio: 3, attack: 10, release: 100 },
  reverb: { mix: 15, size: 40 },
  delay: { mix: 0, timeMs: 250, feedback: 25 },
};

export const VOCAL_PRESETS: VocalPreset[] = [
  { id: "vp-lead-pop", name: "Pop Lead", category: "lead", chain: { compressor: { threshold: -18, ratio: 4, attack: 8, release: 80 } }, voiceProfileId: null },
  { id: "vp-podcast", name: "Podcast Warm", category: "podcast", chain: { eq: { low: -2, mid: 1, high: 0, air: 0 }, noiseCleanup: { enabled: true, amount: 50 } }, voiceProfileId: null },
  { id: "vp-choir", name: "Choir Hall", category: "choir", chain: { reverb: { mix: 35, size: 70 } }, voiceProfileId: null },
];

export const ASSISTANT_SUGGESTIONS_SEED = [
  { category: "recording" as const, title: "Reduce room noise", detail: "Enable noise cleanup at 40% before comping takes." },
  { category: "mic" as const, title: "Mic position", detail: "Try 6–8 inches from the capsule with a pop filter." },
  { category: "eq" as const, title: "Vocal EQ", detail: "Cut 200–400 Hz mud; add 3–5 kHz presence." },
  { category: "compression" as const, title: "Gentle compression", detail: "3:1 ratio, -18 dB threshold for natural dynamics." },
  { category: "layering" as const, title: "Double tracking", detail: "Duplicate take with 20ms delay and ±10 cent detune." },
];
