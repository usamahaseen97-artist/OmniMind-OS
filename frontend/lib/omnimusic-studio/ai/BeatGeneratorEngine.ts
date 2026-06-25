import type { BeatTemplate } from "../ai-types";
import { BEAT_TEMPLATES } from "./constants";

export class BeatGeneratorEngine {
  templates(): BeatTemplate[] {
    return BEAT_TEMPLATES;
  }

  customize(base: BeatTemplate, patch: Partial<BeatTemplate>): BeatTemplate {
    return { ...base, ...patch, id: `beat-custom-${Date.now()}` };
  }
}

export const beatGeneratorEngine = new BeatGeneratorEngine();
