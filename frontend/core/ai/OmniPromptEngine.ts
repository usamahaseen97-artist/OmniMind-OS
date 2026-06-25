import type { PromptValidationResult } from "./types";
import { omniPromptLibrary } from "./OmniPromptLibrary";

/** Prompt rendering, validation, and optimization. */
export class OmniPromptEngine {
  private renderCache = new Map<string, { value: string; expiresAt: number }>();
  private cacheTtlMs = 60_000;
  private cacheMax = 128;

  render(templateId: string, vars: Record<string, string>): string | null {
    const cacheKey = `${templateId}:${JSON.stringify(vars)}`;
    const cached = this.renderCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) return cached.value;

    const tpl = omniPromptLibrary.get(templateId);
    if (!tpl) return null;
    let out = tpl.template;
    tpl.variables.forEach((v) => {
      const val = vars[v.key] ?? v.defaultValue ?? "";
      out = out.replace(new RegExp(`\\{\\{${v.key}\\}\\}`, "g"), val);
    });
    this.setRenderCache(cacheKey, out);
    return out;
  }

  private setRenderCache(key: string, value: string) {
    if (this.renderCache.size >= this.cacheMax) {
      const first = this.renderCache.keys().next().value;
      if (first) this.renderCache.delete(first);
    }
    this.renderCache.set(key, { value, expiresAt: Date.now() + this.cacheTtlMs });
  }

  clearCache() {
    this.renderCache.clear();
  }

  validate(templateId: string, vars: Record<string, string>): PromptValidationResult {
    const tpl = omniPromptLibrary.get(templateId);
    if (!tpl) return { valid: false, errors: ["Template not found"] };
    const errors: string[] = [];
    tpl.variables.forEach((v) => {
      if (v.required && !vars[v.key] && !v.defaultValue) errors.push(`Missing variable: ${v.key}`);
    });
    return { valid: errors.length === 0, errors };
  }

  optimize(prompt: string): string {
    return prompt.trim().replace(/\s+/g, " ");
  }

  test(templateId: string, vars: Record<string, string>) {
    const validation = this.validate(templateId, vars);
    if (!validation.valid) return { ok: false, validation, rendered: null };
    return { ok: true, validation, rendered: this.render(templateId, vars) };
  }
}

export const omniPromptEngine = new OmniPromptEngine();
