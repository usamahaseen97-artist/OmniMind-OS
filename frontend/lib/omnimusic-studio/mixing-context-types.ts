import type {
  AutomationLane,
  DspGraphNode,
  DspRoute,
  MasteringChain,
  MasteringTarget,
  MeterState,
  MixAnalysisReport,
  MixAssistantSuggestion,
  MixBus,
  MixChannelStrip,
  MixingPanel,
  MixPreset,
  ReferenceTrack,
  SpectrumFrame,
} from "./mixing-types";

export type OmniMusicMixingContextSlice = {
  mixingPanel: MixingPanel;
  setMixingPanel: (p: MixingPanel) => void;
  mixChannels: MixChannelStrip[];
  mixBuses: MixBus[];
  selectedMixChannelId: string | null;
  setSelectedMixChannelId: (id: string | null) => void;
  updateMixChannel: (id: string, patch: Partial<MixChannelStrip>) => void;
  updateMixBus: (id: string, patch: Partial<MixBus>) => void;
  addMixBus: (name: string, kind: MixBus["kind"]) => void;
  routingRoutes: DspRoute[];
  connectRoute: (fromId: string, toBusId: string) => void;
  toggleRoute: (id: string) => void;
  fxCatalog: { id: string; type: string; name: string }[];
  addFxInsert: (channelId: string, pluginId: string) => void;
  toggleFxBypass: (channelId: string, insertId: string) => void;
  masteringChain: MasteringChain;
  setMasteringTarget: (target: MasteringTarget) => void;
  updateMastering: (patch: Partial<MasteringChain>) => void;
  meterState: MeterState;
  spectrumFrame: SpectrumFrame;
  mixReport: MixAnalysisReport;
  mixSuggestions: MixAssistantSuggestion[];
  automationLanes: AutomationLane[];
  addAutomationLane: (targetId: string, param: AutomationLane["param"]) => void;
  addAutomationPoint: (laneId: string, beat: number, value: number) => void;
  mixPresets: MixPreset[];
  applyMixPreset: (preset: MixPreset) => void;
  referenceTracks: ReferenceTrack[];
  applyReference: (ref: ReferenceTrack) => void;
  dspGraph: DspGraphNode[];
};
