import type { AgentWorkflow, IntentMatch } from "./types";
import type { ToolRegistry } from "./ToolRegistry";
import { getOmniPluginManager } from "../plugins";

type IntentRule = {
  patterns: RegExp[];
  toolId: string;
  workflowId?: string;
  weight: number;
  reason: string;
};

const INTENT_RULES: IntentRule[] = [
  {
    patterns: [/perfume|e-?commerce|business\s+website|store|landing\s+page/i],
    toolId: "business-website-builder",
    workflowId: "full-stack-deploy",
    weight: 0.92,
    reason: "Business / e-commerce website intent",
  },
  {
    patterns: [/build\s+(a\s+)?website|scaffold|full[\s-]?stack|react\s+app|next\.?js/i],
    toolId: "app-website-builder",
    workflowId: "full-stack-deploy",
    weight: 0.9,
    reason: "Web / app scaffold intent",
  },
  {
    patterns: [/game|phaser|unity|level\s+design|sprite/i],
    toolId: "game-development",
    weight: 0.88,
    reason: "Game development intent",
  },
  {
    patterns: [/villa|bedroom|architect|exterior|landscape|floor\s*plan/i],
    toolId: "architectural-designer",
    weight: 0.9,
    reason: "Architectural design intent",
  },
  {
    patterns: [/medical|diagnos|x-?ray|lab\s+report|triage/i],
    toolId: "medical-diagnostic",
    weight: 0.9,
    reason: "Medical diagnostic intent",
  },
  {
    patterns: [/excel|spreadsheet|analytics|sales|trend|bi\b|dashboard|karachi/i],
    toolId: "business-analytics",
    weight: 0.92,
    reason: "Business analytics intent",
  },
  {
    patterns: [/video|vfx|edit\s+this|timeline|grade|cinematic/i],
    toolId: "vfx-master",
    weight: 0.88,
    reason: "VFX / video editing intent",
  },
  {
    patterns: [/nasa|physics|aerospace|equation|science\s+solver/i],
    toolId: "nasa-solver",
    weight: 0.9,
    reason: "Science solver intent",
  },
  {
    patterns: [/trading|crypto|forex|stock|quantum\s+trading/i],
    toolId: "quantum-trading",
    weight: 0.88,
    reason: "Trading intent",
  },
  {
    patterns: [/logo|image|visionary|ultra[\s-]?realistic|generate\s+image/i],
    toolId: "creative-visionary",
    weight: 0.86,
    reason: "Creative media intent",
  },
  {
    patterns: [/marketing|campaign|ad\s+copy|social\s+media/i],
    toolId: "digital-marketing-hub",
    workflowId: "marketing-campaign",
    weight: 0.88,
    reason: "Marketing campaign intent",
  },
  {
    patterns: [/song|music|audio|melody|omnimusic/i],
    toolId: "omnimusic",
    weight: 0.88,
    reason: "Music creation intent",
  },
  {
    patterns: [/translat|bilingual|meeting|urdu|roman/i],
    toolId: "omnitranslator",
    weight: 0.9,
    reason: "Translation intent",
  },
  {
    patterns: [/map|route|navigation|omnimap/i],
    toolId: "omnimap",
    weight: 0.85,
    reason: "Maps intent",
  },
  {
    patterns: [/deploy|vercel|netlify|hosting/i],
    toolId: "omniforge-engine",
    workflowId: "full-stack-deploy",
    weight: 0.8,
    reason: "Deployment intent",
  },
];

export const MASTER_WORKFLOWS: AgentWorkflow[] = [
  {
    id: "full-stack-deploy",
    name: "Full Stack Deploy",
    description: "Scaffold frontend, backend, database, deploy, document, export",
    steps: [
      { id: "wf-frontend", label: "Generate frontend", toolId: "omniforge-engine", promptTemplate: "Scaffold React/Next.js frontend" },
      { id: "wf-backend", label: "Generate backend", toolId: "omniforge-engine", promptTemplate: "Scaffold FastAPI backend" },
      { id: "wf-database", label: "Generate database", toolId: "omniforge-engine", promptTemplate: "Design PostgreSQL schema" },
      { id: "wf-deploy", label: "Deploy", toolId: "omniforge-engine", actionId: "deploy" },
      { id: "wf-docs", label: "Create documentation", toolId: "omniforge-engine", promptTemplate: "Write README and API docs" },
      { id: "wf-export", label: "Export project", toolId: "omniforge-engine", promptTemplate: "Export project bundle" },
    ],
  },
  {
    id: "marketing-campaign",
    name: "Marketing Campaign",
    description: "Creative assets, copy, and campaign launch",
    steps: [
      { id: "mk-creative", label: "Generate creative", toolId: "creative-visionary", promptTemplate: "Generate campaign visuals" },
      { id: "mk-copy", label: "Write copy", toolId: "digital-marketing-hub", promptTemplate: "Write ad copy and social posts" },
      { id: "mk-launch", label: "Launch campaign", toolId: "digital-marketing-hub", actionId: "campaign" },
    ],
  },
];

/** Natural-language → tool + workflow selection. */
export class IntentEngine {
  constructor(private registry: ToolRegistry) {}

  resolve(text: string, activeToolId?: string): IntentMatch | null {
    const normalized = text.trim();
    if (!normalized) return null;

    let best: IntentMatch | null = null;

    for (const rule of INTENT_RULES) {
      if (!rule.patterns.some((p) => p.test(normalized))) continue;
      const tool = this.registry.get(rule.toolId);
      if (!tool) continue;
      const match: IntentMatch = {
        toolId: tool.id,
        slug: tool.slug,
        confidence: rule.weight,
        reason: rule.reason,
        suggestedWorkflowId: rule.workflowId,
      };
      if (!best || match.confidence > best.confidence) best = match;
    }

    if (!best) {
      const capMatch = getOmniPluginManager().bestCapabilityMatch(normalized);
      if (capMatch) {
        const tool = this.registry.get(capMatch.toolId) ?? this.registry.getBySlug(capMatch.toolId);
        if (tool) {
          best = {
            toolId: tool.id,
            slug: tool.slug,
            confidence: capMatch.confidence,
            reason: capMatch.reason,
          };
        }
      }
    }

    if (!best) {
      const hits = this.registry.search(normalized);
      if (hits[0]) {
        best = {
          toolId: hits[0].id,
          slug: hits[0].slug,
          confidence: 0.55,
          reason: "Keyword registry match",
        };
      }
    }

    if (best && activeToolId && best.toolId === activeToolId) {
      return { ...best, confidence: Math.min(best.confidence, 0.5) };
    }

    return best;
  }

  getWorkflow(id: string): AgentWorkflow | undefined {
    return MASTER_WORKFLOWS.find((w) => w.id === id);
  }

  listWorkflows(): AgentWorkflow[] {
    return MASTER_WORKFLOWS;
  }
}
