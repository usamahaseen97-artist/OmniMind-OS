import type { MusicPromptSpec } from "../ai-types";
import { DEFAULT_PROMPT } from "./constants";

export class PromptEngine {
  create(overrides: Partial<MusicPromptSpec> = {}): MusicPromptSpec {
    return {
      ...DEFAULT_PROMPT,
      ...overrides,
      id: overrides.id ?? `prompt-${Date.now()}`,
      advanced: { ...DEFAULT_PROMPT.advanced, ...overrides.advanced },
    };
  }

  validate(spec: MusicPromptSpec): string[] {
    const errors: string[] = [];
    if (!spec.prompt.trim() && spec.workflow !== "chords-to-song") {
      errors.push("Prompt is required for this workflow");
    }
    if (spec.bpm < 40 || spec.bpm > 240) errors.push("BPM must be 40–240");
    if (spec.durationSec < 5 || spec.durationSec > 600) errors.push("Duration must be 5–600 seconds");
    if (spec.creativity < 0 || spec.creativity > 100) errors.push("Creativity must be 0–100");
    return errors;
  }

  serialize(spec: MusicPromptSpec): string {
    return JSON.stringify(spec);
  }
}

export const promptEngine = new PromptEngine();
