import { PROMPT_TEMPLATES } from "./constants";
import type { AIWorkflowKind, PromptDraft, PromptVariable } from "./types";
import { createDefaultPrompt } from "./constants";

/** Saved and built-in prompt templates with variable substitution. */
export class PromptTemplates {
  private saved: { id: string; label: string; draft: PromptDraft }[] = [];

  listBuiltIn() {
    return PROMPT_TEMPLATES;
  }

  listSaved() {
    return this.saved;
  }

  applyTemplate(templateId: string, workflow?: AIWorkflowKind): PromptDraft | null {
    const tpl = PROMPT_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return null;

    const draft = createDefaultPrompt(workflow ?? tpl.workflow);
    draft.positive = tpl.positive;
    draft.negative = tpl.negative;
    draft.workflow = tpl.workflow;
    draft.label = tpl.label;
    return draft;
  }

  save(draft: PromptDraft, label: string) {
    const entry = { id: `saved-${Date.now()}`, label, draft: { ...draft, label, savedAt: new Date().toISOString() } };
    this.saved = [entry, ...this.saved];
    return entry;
  }

  extractVariables(text: string): PromptVariable[] {
    const matches = text.match(/\{\{(\w+)\}\}/g) ?? [];
    const keys = [...new Set(matches.map((m) => m.slice(2, -2)))];
    return keys.map((key) => ({
      key,
      value: "",
      label: key.charAt(0).toUpperCase() + key.slice(1),
    }));
  }
}

export const promptTemplates = new PromptTemplates();
