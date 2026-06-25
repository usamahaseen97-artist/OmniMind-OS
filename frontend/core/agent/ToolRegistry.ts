import { SOVEREIGN_TOOLS } from "../../lib/sovereign-tool-registry";
import type { AgentToolAction, AgentToolDefinition, OmniMindPlugin } from "./types";

const TOOL_ACTIONS: Record<string, AgentToolAction[]> = {
  "omniforge-engine": [
    { id: "scaffold", label: "Scaffold Project", command: "scaffold:Build full-stack project" },
    { id: "run", label: "Run Preview", command: "run:preview" },
    { id: "deploy", label: "Deploy", command: "deploy:one-click" },
  ],
  "business-analytics": [
    { id: "analyze", label: "Analyze Dataset", command: "agent:Analyze sales and trends" },
    { id: "export", label: "Export Report", command: "agent:Export analytics report" },
  ],
  "creative-visionary": [
    { id: "generate-image", label: "Generate Image", command: "agent:Generate ultra-realistic image" },
    { id: "generate-video", label: "Generate Video", command: "agent:Generate cinematic video scene" },
  ],
  "vfx-master": [
    { id: "edit-video", label: "Edit Video", command: "agent:Edit and grade this video" },
  ],
  "digital-marketing-hub": [
    { id: "campaign", label: "Create Campaign", command: "agent:Generate marketing campaign" },
  ],
  "architectural-designer": [
    { id: "design-villa", label: "Design Villa", command: "agent:Create 6-bedroom villa design" },
  ],
  "medical-diagnostic": [
    { id: "triage", label: "Run Triage", command: "agent:Analyze medical scan" },
  ],
  "nasa-solver": [
    { id: "solve", label: "Solve Equation", command: "agent:Solve physics problem" },
  ],
  "quantum-trading": [
    { id: "signals", label: "Trading Signals", command: "agent:Show live trading signals" },
  ],
  omnimusic: [{ id: "compose", label: "Create Song", command: "agent:Create a song" }],
  omnitranslator: [{ id: "translate", label: "Translate", command: "agent:Translate this meeting" }],
};

const EXTRA_ALIASES: AgentToolDefinition[] = [
  {
    id: "game-development",
    slug: "omniforge-engine",
    name: "Game Development",
    description: "Phaser, Unity-style game scaffolds and logic",
    href: "/omniforge-engine?stack=game",
    capabilities: ["game-scaffold", "physics", "sprites", "levels"],
    actions: TOOL_ACTIONS["omniforge-engine"] ?? [],
    permissions: ["read", "write", "execute"],
    supportedInputs: ["prompt", "game-design-doc", "assets"],
    supportedOutputs: ["game-project", "scenes", "code"],
    keywords: ["game", "phaser", "unity", "level", "sprite"],
    routeId: "omniforge-engine",
    pluginId: "core",
  },
  {
    id: "app-website-builder",
    slug: "omniforge-engine",
    name: "App & Website Builder",
    description: "React, Next.js, FastAPI full-stack apps",
    href: "/omniforge-engine?stack=web",
    capabilities: ["scaffold", "react", "nextjs", "api"],
    actions: TOOL_ACTIONS["omniforge-engine"] ?? [],
    permissions: ["read", "write", "deploy", "execute"],
    supportedInputs: ["prompt", "prd", "wireframe"],
    supportedOutputs: ["website", "api", "database-schema"],
    keywords: ["react", "next", "website", "app", "fullstack"],
    routeId: "omniforge-engine",
    pluginId: "core",
  },
  {
    id: "business-website-builder",
    slug: "omniforge-engine",
    name: "Business Website Builder",
    description: "Perfume stores, e-commerce, landing pages",
    href: "/omniforge-engine?stack=business",
    capabilities: ["ecommerce", "landing-page", "checkout"],
    actions: TOOL_ACTIONS["omniforge-engine"] ?? [],
    permissions: ["read", "write", "deploy"],
    supportedInputs: ["prompt", "brand", "product-catalog"],
    supportedOutputs: ["business-site", "cms"],
    keywords: ["perfume", "business", "store", "ecommerce", "landing"],
    routeId: "omniforge-engine",
    pluginId: "core",
  },
  {
    id: "omnicharge",
    slug: "omnicharge",
    name: "OmniCharge Utility",
    description: "Billing, usage, and utility dashboard",
    href: "/",
    capabilities: ["billing", "usage", "utility"],
    actions: [{ id: "usage", label: "View Usage", command: "agent:Show usage dashboard" }],
    permissions: ["read"],
    supportedInputs: ["account"],
    supportedOutputs: ["usage-report"],
    keywords: ["charge", "billing", "utility", "usage"],
    pluginId: "core",
  },
];

function sovereignToAgentTool(tool: (typeof SOVEREIGN_TOOLS)[number]): AgentToolDefinition {
  return {
    id: tool.slug,
    slug: tool.slug,
    name: tool.name,
    description: tool.description,
    href: tool.href,
    capabilities: [tool.layout, tool.tagline],
    actions: TOOL_ACTIONS[tool.slug] ?? [{ id: "open", label: `Open ${tool.name}` }],
    permissions: ["read", "write", "execute"],
    supportedInputs: ["prompt", "text", "file", "voice-transcript"],
    supportedOutputs: ["text", "code", "media", "report", "deployment"],
    keywords: [
      tool.slug.replace(/-/g, " "),
      tool.name.toLowerCase(),
      ...tool.description.toLowerCase().split(/\s+/).slice(0, 8),
    ],
    routeId: tool.omniRouteId ?? tool.slug,
    pluginId: "core",
  };
}

/** Central registry — sovereign tools + aliases + plugins. */
export class ToolRegistry {
  private tools = new Map<string, AgentToolDefinition>();

  constructor() {
    for (const t of SOVEREIGN_TOOLS) {
      const def = sovereignToAgentTool(t);
      this.tools.set(def.id, def);
    }
    for (const extra of EXTRA_ALIASES) {
      this.tools.set(extra.id, extra);
    }
  }

  register(tool: AgentToolDefinition) {
    this.tools.set(tool.id, tool);
  }

  registerPlugin(plugin: OmniMindPlugin) {
    plugin.registerTools((tool) => this.register(tool));
    plugin.onInstall?.();
  }

  get(id: string): AgentToolDefinition | undefined {
    return this.tools.get(id);
  }

  getBySlug(slug: string): AgentToolDefinition | undefined {
    return [...this.tools.values()].find((t) => t.slug === slug);
  }

  list(): AgentToolDefinition[] {
    return [...this.tools.values()];
  }

  search(query: string): AgentToolDefinition[] {
    const q = query.toLowerCase();
    return this.list().filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.keywords.some((k) => k.includes(q) || q.includes(k)),
    );
  }
}

export const globalToolRegistry = new ToolRegistry();
