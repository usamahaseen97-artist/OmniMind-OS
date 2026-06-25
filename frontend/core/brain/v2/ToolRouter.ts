import { getOmniPluginManager } from "../../plugins";
import type { Brain2ToolRoute } from "./types";

const TOOL_PATTERNS: { toolId: string; patterns: RegExp[]; capability: string }[] = [
  { toolId: "medical-diagnostic", patterns: [/medical|diagnos|x-?ray|scan|triage|patient/i], capability: "analyze-medical-image" },
  { toolId: "omniforge-engine", patterns: [/code|build|scaffold|react|api|deploy|website|app\b/i], capability: "generate-code" },
  { toolId: "app-website-builder", patterns: [/website|web\s*app|next\.?js/i], capability: "generate-code" },
  { toolId: "creative-visionary", patterns: [/image|logo|ultra[\s-]?realistic|visionary/i], capability: "generate-video" },
  { toolId: "vfx-master", patterns: [/vfx|edit\s+video|timeline|grade/i], capability: "edit-video" },
  { toolId: "omnimusic", patterns: [/music|song|audio|melody/i], capability: "generate-music" },
  { toolId: "architectural-designer", patterns: [/villa|architect|exterior|floor\s*plan/i], capability: "create-architecture" },
  { toolId: "business-analytics", patterns: [/analytics|excel|dashboard|sales|data/i], capability: "analyze-data" },
  { toolId: "quantum-trading", patterns: [/trading|crypto|forex|stock|finance/i], capability: "financial-analysis" },
  { toolId: "omnitranslator", patterns: [/translat|bilingual|urdu|roman/i], capability: "translate" },
  { toolId: "nasa-solver", patterns: [/nasa|physics|science|equation/i], capability: "scientific-simulation" },
  { toolId: "digital-marketing-hub", patterns: [/marketing|campaign|ads/i], capability: "marketing-campaign" },
];

/** Automatic tool detection — no manual tool selection. */
export class Brain2ToolRouter {
  route(text: string, activeToolId?: string): Brain2ToolRoute {
    const pluginMatch = getOmniPluginManager().bestCapabilityMatch(text);
    if (pluginMatch) {
      return {
        toolId: pluginMatch.toolId,
        reason: pluginMatch.reason,
        confidence: pluginMatch.confidence,
        capability: pluginMatch.capability,
      };
    }

    for (const entry of TOOL_PATTERNS) {
      if (entry.patterns.some((p) => p.test(text))) {
        return { toolId: entry.toolId, reason: `Pattern match: ${entry.capability}`, confidence: 0.85, capability: entry.capability };
      }
    }

    if (activeToolId) {
      return { toolId: activeToolId, reason: "Active workspace context", confidence: 0.6 };
    }

    return { toolId: "omniforge-engine", reason: "Default development orchestration", confidence: 0.5 };
  }
}

let router: Brain2ToolRouter | null = null;

export function getBrain2ToolRouter(): Brain2ToolRouter {
  if (!router) router = new Brain2ToolRouter();
  return router;
}
