import type { MasteringChain, MasteringTarget, MixPreset } from "../mixing-types";

export const MASTERING_TARGETS: { id: MasteringTarget; label: string; lufs: number }[] = [
  { id: "streaming", label: "Streaming", lufs: -14 },
  { id: "radio", label: "Radio", lufs: -12 },
  { id: "podcast", label: "Podcast", lufs: -16 },
  { id: "cinema", label: "Cinema", lufs: -24 },
  { id: "club", label: "Club", lufs: -8 },
  { id: "broadcast", label: "Broadcast", lufs: -23 },
  { id: "vinyl", label: "Vinyl (placeholder)", lufs: -12 },
];

export const DEFAULT_MASTERING: MasteringChain = {
  target: "streaming",
  targetLufs: -14,
  truePeak: -1,
  dynamicRange: 8,
  referenceMatch: false,
  referenceTrackId: null,
  limiterCeiling: -0.3,
  eqTilt: 0,
  stereoWidth: 100,
};

export const FX_PLUGIN_CATALOG: { id: string; type: import("../mixing-types").FxPluginType; name: string }[] = [
  { id: "fx-eq", type: "parametric-eq", name: "Parametric EQ" },
  { id: "fx-deq", type: "dynamic-eq", name: "Dynamic EQ" },
  { id: "fx-comp", type: "compressor", name: "Compressor" },
  { id: "fx-lim", type: "limiter", name: "Limiter" },
  { id: "fx-gate", type: "gate", name: "Gate" },
  { id: "fx-exp", type: "expander", name: "Expander" },
  { id: "fx-dess", type: "de-esser", name: "De-Esser" },
  { id: "fx-exc", type: "exciter", name: "Exciter" },
  { id: "fx-sat", type: "saturation", name: "Saturation" },
  { id: "fx-tape", type: "tape", name: "Tape" },
  { id: "fx-tube", type: "tube", name: "Tube" },
  { id: "fx-rev", type: "reverb", name: "Reverb" },
  { id: "fx-dly", type: "delay", name: "Delay" },
  { id: "fx-cho", type: "chorus", name: "Chorus" },
  { id: "fx-fla", type: "flanger", name: "Flanger" },
  { id: "fx-pha", type: "phaser", name: "Phaser" },
  { id: "fx-stw", type: "stereo-width", name: "Stereo Width" },
  { id: "fx-trn", type: "transient-designer", name: "Transient Designer" },
  { id: "fx-clip", type: "clipper", name: "Clipper" },
  { id: "fx-mbc", type: "multiband-compressor", name: "Multiband Compressor" },
];

export const MIX_PRESETS: MixPreset[] = [
  { id: "mp-pop-vox", name: "Pop Vocal", category: "Vocals", channelStrip: { gain: 0.85 } },
  { id: "mp-drums-bus", name: "Drum Bus Glue", category: "Drums", channelStrip: { gain: 0.9 } },
  { id: "mp-master-stream", name: "Streaming Master", category: "Mastering", mastering: { target: "streaming", targetLufs: -14 } },
];

export const REFERENCE_TRACKS = [
  { id: "ref-1", name: "Reference Pop", artist: "Demo", targetLufs: -14, genre: "Pop" },
  { id: "ref-2", name: "Reference Hip Hop", artist: "Demo", targetLufs: -12, genre: "Hip Hop" },
];
