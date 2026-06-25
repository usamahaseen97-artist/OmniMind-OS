import type {
  LyricsSyncDocument,
  PerformanceMonitorState,
  SmartRecordingState,
  VocalAssistantSuggestion,
  VocalProcessingChain,
  VoiceAnalysisReport,
  VoiceProfile,
  VocalPreset,
  VocalTake,
} from "../vocal-types";
import { voiceAuthorizationEngine } from "./VoiceAuthorizationEngine";
import { vocalTakeManagerEngine } from "./VocalTakeManagerEngine";
import { voiceAnalyzerCore } from "./VoiceAnalyzerCore";
import { smartRecordingEngine } from "./SmartRecordingEngine";
import { vocalLibraryEngine } from "./VocalLibraryEngine";
import { DEFAULT_VOCAL_CHAIN } from "./constants";

export class VocalSessionCoordinator {
  processingChain: VocalProcessingChain = { ...DEFAULT_VOCAL_CHAIN };
  lyricsSync: LyricsSyncDocument | null = null;
  analysis: VoiceAnalysisReport | null = null;
  performance: PerformanceMonitorState = { inputLevel: 0, peakLevel: 0, clipping: false, latencyMs: 0, cpuPercent: 0 };

  init() {
    voiceAuthorizationEngine.seedBuiltin();
  }

  analyzeTake(takeId: string) {
    this.analysis = voiceAnalyzerCore.analyze(takeId);
    return this.analysis;
  }

  get recording(): SmartRecordingState {
    return smartRecordingEngine.state;
  }

  get takes(): VocalTake[] {
    return vocalTakeManagerEngine.list();
  }

  profiles(): VoiceProfile[] {
    return vocalLibraryEngine.profiles();
  }

  presets(): VocalPreset[] {
    return vocalLibraryEngine.presets();
  }
}

export const vocalSessionCoordinator = new VocalSessionCoordinator();
