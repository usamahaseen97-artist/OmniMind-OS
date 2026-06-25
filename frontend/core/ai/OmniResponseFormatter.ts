import type { FormattedResponse } from "./types";

/** Normalizes provider responses into consistent formats. */
export class OmniResponseFormatter {
  format(text: string, structured?: Record<string, unknown>): FormattedResponse {
    return {
      text,
      markdown: text,
      structured: structured ?? null,
    };
  }

  fromStub(stub: string): FormattedResponse {
    return this.format(stub, { source: "omni-ai-stub", architecture: true });
  }

  extractJson(text: string): Record<string, unknown> | null {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}

export const omniResponseFormatter = new OmniResponseFormatter();
