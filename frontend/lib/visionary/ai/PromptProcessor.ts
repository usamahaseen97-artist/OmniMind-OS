import type { AIWorkflowKind, ModelProviderId, PromptDraft } from "./types";

/** Normalizes, validates, and resolves variables in creative prompts. */
export class PromptProcessor {
  process(draft: PromptDraft): { resolved: string; tokens: number; warnings: string[] } {
    const warnings: string[] = [];
    let resolved = draft.positive.trim();

    for (const v of draft.variables) {
      const token = `{{${v.key}}}`;
      if (resolved.includes(token) && !v.value.trim()) {
        warnings.push(`Variable "${v.label}" is empty`);
      }
      resolved = resolved.split(token).join(v.value || v.key);
    }

    if (draft.multiPrompts.length > 0) {
      const weighted = draft.multiPrompts
        .filter((p) => p.text.trim())
        .map((p) => `(${p.text}:${p.weight.toFixed(2)})`)
        .join(" ");
      if (weighted) resolved = `${resolved} ${weighted}`.trim();
    }

    const tokens = Math.ceil(resolved.split(/\s+/).filter(Boolean).length * 1.3);
    if (!resolved) warnings.push("Positive prompt is empty");

    return { resolved, tokens, warnings };
  }

  validateForWorkflow(draft: PromptDraft): string[] {
    const errors: string[] = [];
    const needsImage = draft.workflow.startsWith("image-to");
    if (needsImage && draft.referenceImageIds.length === 0) {
      errors.push("Reference image required for image-input workflows");
    }
    if (draft.steps < 1 || draft.steps > 150) errors.push("Steps must be between 1 and 150");
    if (draft.cfg < 1 || draft.cfg > 30) errors.push("CFG must be between 1 and 30");
    return errors;
  }

  static workflowOutputKind(workflow: AIWorkflowKind): "image" | "video" | "3d" | "mixed" {
    if (workflow.includes("video") || workflow === "text-to-cinematic") return "video";
    if (workflow === "text-to-3d") return "3d";
    if (workflow.includes("social") || workflow.includes("ad") || workflow.includes("website") || workflow.includes("game"))
      return "mixed";
    return "image";
  }
}
