/** OmniMusic Studio — Mixing & Mastering types (Phase 5). */

export type MixingPanel = "mixer" | "mastering" | "fx" | "analysis" | "automation" | "dsp";

export type BusKind = "aux" | "group" | "master" | "monitor" | "cue" | "folder";

export type MixBus = {
  id: string;
  name: string;
  kind: BusKind;
  gain: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  parentId: string | null;
  fxSlotIds: string[];
};

export type MixChannelStrip = {
  id: string;
  trackId: string;
  name: string;
  gain: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  peakL: number;
  peakR: number;
  rmsL: number;
  rmsR: number;
  busId: string | null;
  folderId: string | null;
  sends: MixSend[];
  inserts: FxInsert[];
  sidechainSourceId: string | null;
};

export type MixSend = {
  id: string;
  busId: string;
  level: number;
  preFader: boolean;
};

export type FxInsert = {
  id: string;
  pluginId: string;
  name: string;
  bypassed: boolean;
  presetId: string | null;
};

export type FxPluginType =
  | "parametric-eq"
  | "dynamic-eq"
  | "compressor"
  | "limiter"
  | "gate"
  | "expander"
  | "de-esser"
  | "exciter"
  | "saturation"
  | "tape"
  | "tube"
  | "reverb"
  | "delay"
  | "chorus"
  | "flanger"
  | "phaser"
  | "stereo-width"
  | "transient-designer"
  | "clipper"
  | "multiband-compressor";

export type DspRoute = {
  id: string;
  fromChannelId: string;
  toBusId: string;
  gain: number;
  enabled: boolean;
};

export type EqBand = { freq: number; gain: number; q: number; type: "bell" | "shelf" | "highpass" | "lowpass" };

export type CompressorParams = { threshold: number; ratio: number; attack: number; release: number; knee: number };

export type MasteringTarget = "streaming" | "radio" | "podcast" | "cinema" | "club" | "broadcast" | "vinyl";

export type MasteringChain = {
  target: MasteringTarget;
  targetLufs: number;
  truePeak: number;
  dynamicRange: number;
  referenceMatch: boolean;
  referenceTrackId: string | null;
  limiterCeiling: number;
  eqTilt: number;
  stereoWidth: number;
};

export type MeterState = {
  peakL: number;
  peakR: number;
  rmsL: number;
  rmsR: number;
  lufsIntegrated: number;
  lufsShort: number;
  lufsMomentary: number;
  correlation: number;
  phase: number;
};

export type SpectrumFrame = {
  bins: number[];
  timestamp: number;
};

export type MixAnalysisReport = {
  id: string;
  clipping: boolean;
  mudFreqHz: number[];
  harshFreqHz: number[];
  dynamicRangeDb: number;
  stereoBalance: number;
  suggestions: MixAssistantSuggestion[];
};

export type MixAssistantSuggestion = {
  id: string;
  category: "eq" | "compression" | "limiter" | "stereo" | "gain" | "master" | "clip" | "mud" | "harsh";
  title: string;
  detail: string;
};

export type AutomationCurveKind = "linear" | "bezier" | "step";

export type AutomationLane = {
  id: string;
  targetId: string;
  param: "volume" | "pan" | "send" | "plugin" | "tempo" | "custom";
  points: AutomationCurvePoint[];
};

export type AutomationCurvePoint = {
  id: string;
  beat: number;
  value: number;
  curve: AutomationCurveKind;
};

export type MixPreset = {
  id: string;
  name: string;
  category: string;
  channelStrip?: Partial<MixChannelStrip>;
  mastering?: Partial<MasteringChain>;
  fxChain?: FxInsert[];
};

export type ReferenceTrack = {
  id: string;
  name: string;
  artist: string;
  targetLufs: number;
  genre: string;
};

export type DspGraphNode = {
  id: string;
  type: "input" | "channel" | "bus" | "fx" | "master" | "output";
  label: string;
  connections: string[];
};
