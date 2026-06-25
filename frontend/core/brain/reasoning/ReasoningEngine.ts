import type { IntentMatch } from "../../agent/types";

export type ReasoningResult = {
  summary: string;
  goals: string[];
  constraints: string[];
  domains: string[];
  confidence: number;
};

const DOMAIN_KEYWORDS: Record<string, RegExp[]> = {
  commerce: [/perfume|store|e-?commerce|shop|product|checkout/i],
  web: [/website|web\s*app|landing|next\.?js|react/i],
  architecture: [/house|villa|floor\s*plan|exterior|landscape/i],
  analytics: [/report|analytics|excel|sales|dashboard|trend/i],
  media: [/video|vfx|music|song|audio|image|logo/i],
  medical: [/medical|diagnos|scan|x-?ray|patient/i],
  science: [/nasa|physics|equation|science/i],
  trading: [/trading|crypto|forex|stock/i],
  translation: [/translat|bilingual|urdu|roman/i],
};

/** Lightweight NL understanding + reasoning — no external LLM required. */
export class ReasoningEngine {
  understand(text: string): { intent: string; entities: string[]; complexity: "simple" | "complex" } {
    const normalized = text.trim();
    const entities: string[] = [];
    const companyMatch = normalized.match(/(?:build|create|start)\s+(?:a\s+)?(.{3,40}?)(?:\s+company|\s+business|$)/i);
    if (companyMatch?.[1]) entities.push(companyMatch[1].trim());
    const productMatch = normalized.match(/(perfume|saas|erp|crm|game|app|website|house|report)/i);
    if (productMatch?.[1]) entities.push(productMatch[1].toLowerCase());

    const complex =
      /company|full[\s-]?stack|end[\s-]?to[\s-]?end|everything|complete|launch|deploy/i.test(normalized) ||
      entities.length >= 2;

    return {
      intent: complex ? "multi-domain initiative" : "single-tool task",
      entities,
      complexity: complex ? "complex" : "simple",
    };
  }

  reason(text: string, intent: IntentMatch | null): ReasoningResult {
    const understanding = this.understand(text);
    const domains = Object.entries(DOMAIN_KEYWORDS)
      .filter(([, patterns]) => patterns.some((p) => p.test(text)))
      .map(([d]) => d);

    if (!domains.length && intent) domains.push(intent.reason.split(" ")[0]?.toLowerCase() ?? "general");

    const goals = [
      understanding.complexity === "complex" ? "Orchestrate multi-step delivery" : "Complete focused task",
      intent ? `Route to ${intent.slug}` : "Select best sovereign tool",
      "Preserve workspace context across tools",
    ];

    const constraints = [
      "Do not break existing project state",
      "Ask permission before destructive operations",
      "Keep user-facing experience as one AI",
    ];

    return {
      summary: `Understanding: ${understanding.intent}. Entities: ${understanding.entities.join(", ") || "general request"}.`,
      goals,
      constraints,
      domains: domains.length ? domains : ["general"],
      confidence: intent?.confidence ?? (understanding.complexity === "complex" ? 0.78 : 0.65),
    };
  }
}
