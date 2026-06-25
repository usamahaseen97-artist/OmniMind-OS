import type { PromptDraft } from "./types";

/** Suggests prompt improvements — architecture stub, no LLM calls. */
export class PromptOptimizer {
  optimize(draft: PromptDraft): {
    optimized: PromptDraft;
    suggestions: string[];
    score: number;
  } {
    const suggestions: string[] = [];
    let positive = draft.positive.trim();
    let score = 60;

    if (positive.length < 20) {
      suggestions.push("Expand the positive prompt with subject, environment, and lighting details.");
      positive += positive ? "" : "Highly detailed subject, professional composition";
      score -= 15;
    } else {
      score += 10;
    }

    if (!draft.negative.includes("watermark")) {
      suggestions.push('Add "watermark" to negative prompt for cleaner outputs.');
    }

    if (draft.camera.lighting === "Natural" && draft.workflow.includes("cinematic")) {
      suggestions.push("Consider Golden Hour or Dramatic lighting for cinematic workflows.");
      score += 5;
    }

    if (draft.referenceImageIds.length > 0 && !positive.toLowerCase().includes("reference")) {
      suggestions.push("Mention reference image style alignment in the prompt.");
      score += 5;
    }

    score = Math.min(100, Math.max(0, score + Math.floor(draft.creativity * 20)));

    return {
      optimized: { ...draft, positive },
      suggestions,
      score,
    };
  }
}

export const promptOptimizer = new PromptOptimizer();
