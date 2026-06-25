import type { VocalAssistantSuggestion } from "../vocal-types";
import { ASSISTANT_SUGGESTIONS_SEED } from "./constants";

export class VocalAssistantEngine {
  suggestions(report?: { dynamicsDb?: number; energy?: number }): VocalAssistantSuggestion[] {
    return ASSISTANT_SUGGESTIONS_SEED.map((s, i) => ({
      id: `sug-${i}`,
      ...s,
      priority: s.category === "recording" ? "high" : "medium",
    }));
  }
}

export const vocalAssistantEngine = new VocalAssistantEngine();
