import type { BrowserTab, TrackKind } from "./types";

export const BROWSER_TABS: { id: BrowserTab; label: string }[] = [
  { id: "samples", label: "Samples" },
  { id: "loops", label: "Loops" },
  { id: "instruments", label: "Instruments" },
  { id: "projects", label: "Projects" },
  { id: "presets", label: "Presets" },
  { id: "templates", label: "Templates" },
  { id: "favorites", label: "Favorites" },
  { id: "recent", label: "Recent" },
];

export const TRACK_COLORS: Record<TrackKind, string> = {
  audio: "#38bdf8",
  midi: "#a78bfa",
  instrument: "#f472b6",
  group: "#fbbf24",
  bus: "#34d399",
  master: "#f87171",
};

export const SEED_TRACKS = [
  { id: "tr-master", name: "Master", kind: "master" as const, color: "#f87171" },
  { id: "tr-drums", name: "Drums", kind: "instrument" as const, color: "#f472b6" },
  { id: "tr-bass", name: "Bass", kind: "midi" as const, color: "#a78bfa" },
  { id: "tr-pad", name: "Pad", kind: "midi" as const, color: "#c084fc" },
  { id: "tr-vox", name: "Vocals", kind: "audio" as const, color: "#38bdf8" },
  { id: "tr-fx", name: "FX Bus", kind: "bus" as const, color: "#34d399" },
];

export const INTERNAL_PLUGINS = [
  { id: "pl-eq", name: "Omni EQ", vendor: "OmniMind", category: "EQ" },
  { id: "pl-comp", name: "Omni Compressor", vendor: "OmniMind", category: "Dynamics" },
  { id: "pl-rev", name: "Omni Reverb", vendor: "OmniMind", category: "Reverb" },
  { id: "pl-synth", name: "Omni Synth", vendor: "OmniMind", category: "Instrument" },
];

export const BROWSER_SEED: { tab: BrowserTab; items: string[] }[] = [
  { tab: "samples", items: ["Kick 808", "Snare Tight", "HiHat Open", "Clap Studio"] },
  { tab: "loops", items: ["Trap Loop 140", "House Groove", "Lo-Fi Beat", "Cinematic Strings"] },
  { tab: "instruments", items: ["Grand Piano", "Analog Bass", "String Ensemble", "Omni Synth"] },
];
