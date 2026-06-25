import type { PromptTemplate } from "./types";
import { PROMPT_LIBRARY_SEED } from "./constants";

/** Reusable prompt template library with versioning. */
export class OmniPromptLibrary {
  templates: PromptTemplate[] = PROMPT_LIBRARY_SEED.map((t) => ({ ...t }));

  list(category?: string) {
    return category ? this.templates.filter((t) => t.category === category) : [...this.templates];
  }

  get(id: string) {
    return this.templates.find((t) => t.id === id) ?? null;
  }

  save(template: PromptTemplate) {
    const idx = this.templates.findIndex((t) => t.id === template.id);
    if (idx >= 0) {
      template.version = (this.templates[idx]!.version ?? 1) + 1;
      this.templates[idx] = template;
    } else {
      this.templates.push(template);
    }
    return template;
  }
}

export const omniPromptLibrary = new OmniPromptLibrary();
