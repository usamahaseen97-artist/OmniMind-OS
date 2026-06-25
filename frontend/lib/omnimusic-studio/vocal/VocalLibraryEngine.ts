import { voiceAuthorizationEngine } from "./VoiceAuthorizationEngine";
import { VOCAL_PRESETS } from "./constants";
import type { VoiceProfile, VocalPreset } from "../vocal-types";

export class VocalLibraryEngine {
  profiles(): VoiceProfile[] {
    const existing = voiceAuthorizationEngine.list();
    return existing.length ? existing : voiceAuthorizationEngine.seedBuiltin();
  }

  presets(): VocalPreset[] {
    return VOCAL_PRESETS;
  }

  byCategory(category: VoiceProfile["category"]): VoiceProfile[] {
    return this.profiles().filter((p) => p.category === category);
  }
}

export const vocalLibraryEngine = new VocalLibraryEngine();
