import type { SovereignToolDef } from "../../../lib/sovereign-tool-registry";
import { SOVEREIGN_TOOLS } from "../../../lib/sovereign-tool-registry";
import type { OmniCapability, OmniPluginManifest, PluginActionDefinition } from "../types";

const CATEGORY_BY_LAYOUT: Record<string, string> = {
  "architect-split": "development",
  "design-split": "creative",
  "medical-split": "medical",
  "trading-terminal": "finance",
  "video-suite": "creative",
  "analytics-dashboard": "analytics",
  "vfx-timeline": "creative",
  "science-console": "science",
  "marketing-hub": "marketing",
  "visionary-enterprise": "creative",
  "clinical-enterprise": "medical",
  "entertainment-full": "entertainment",
  "map-full": "utility",
  "translator-dual": "utility",
};

const CAPABILITIES_BY_SLUG: Record<string, OmniCapability[]> = {
  "omniforge-engine": ["generate-code", "deploy"],
  "architectural-designer": ["create-architecture"],
  "interior-landscape": ["create-architecture"],
  "medical-diagnostic": ["analyze-medical-image"],
  "medical-diagnostic-suite": ["analyze-medical-image"],
  "quantum-trading": ["financial-analysis"],
  "creative-visionary": ["generate-video"],
  "visionary-studio": ["generate-video", "edit-video"],
  "business-analytics": ["analyze-data", "financial-analysis"],
  "vfx-master": ["edit-video", "generate-video"],
  "nasa-solver": ["scientific-simulation"],
  "digital-marketing-hub": ["marketing-campaign", "voice-processing"],
  omnimap: ["navigation-maps"],
  omnimusic: ["generate-music", "voice-processing"],
  omnitv: ["entertainment-streaming"],
  omnimovies: ["entertainment-streaming", "generate-video"],
  omnitranslator: ["translate", "voice-processing"],
};

const PERMISSIONS_BY_SLUG: Record<string, OmniPluginManifest["permissions"]> = {
  "omniforge-engine": ["filesystem", "network", "terminal", "deployment", "browser"],
  "medical-diagnostic": ["filesystem", "camera", "network"],
  "medical-diagnostic-suite": ["filesystem", "camera", "network", "database"],
  "business-analytics": ["filesystem", "database", "network"],
  "vfx-master": ["filesystem", "network"],
  "creative-visionary": ["filesystem", "network"],
  "visionary-studio": ["filesystem", "network", "browser"],
  "digital-marketing-hub": ["filesystem", "network", "browser"],
  omnitranslator: ["microphone", "network"],
  omnimusic: ["microphone", "filesystem", "network"],
  omnimap: ["network", "browser"],
  "quantum-trading": ["network", "database"],
};

const ACTIONS_BY_SLUG: Record<string, PluginActionDefinition[]> = {
  "omniforge-engine": [
    { id: "createProject", label: "Create Project", command: "scaffold:Build full-stack project", capability: "generate-code", permission: "filesystem" },
    { id: "deploy", label: "Deploy", command: "deploy:one-click", capability: "deploy", permission: "deployment" },
  ],
  "business-analytics": [
    { id: "runAnalysis", label: "Run Analysis", command: "agent:Analyze sales and trends", capability: "analyze-data", permission: "database" },
    { id: "forecast", label: "Forecast", command: "agent:Forecast metrics", capability: "analyze-data" },
    { id: "export", label: "Export Report", command: "agent:Export analytics report", permission: "filesystem" },
  ],
  "medical-diagnostic": [
    { id: "scanImage", label: "Scan Image", command: "agent:Analyze medical scan", capability: "analyze-medical-image", permission: "camera" },
    { id: "runAnalysis", label: "Run Triage", command: "agent:Run triage", capability: "analyze-medical-image" },
  ],
  "medical-diagnostic-suite": [
    { id: "openPatient", label: "Open Patient Chart", command: "medical:Open patient workspace", capability: "analyze-medical-image", permission: "filesystem" },
    { id: "uploadImaging", label: "Upload Imaging", command: "medical:Upload imaging study", capability: "analyze-medical-image", permission: "camera" },
    { id: "clinicalWorkflow", label: "Advance Workflow", command: "medical:Advance clinical workflow", capability: "analyze-medical-image" },
  ],
  "vfx-master": [
    { id: "renderVideo", label: "Render Video", command: "agent:Edit and grade this video", capability: "edit-video" },
    { id: "edit-video", label: "Edit Timeline", capability: "edit-video", permission: "filesystem" },
  ],
  "creative-visionary": [
    { id: "generate-image", label: "Generate Image", command: "agent:Generate ultra-realistic image", capability: "generate-video" },
    { id: "renderVideo", label: "Generate Video", command: "agent:Generate cinematic video scene", capability: "generate-video" },
  ],
  "visionary-studio": [
    { id: "openProject", label: "Open Project", command: "visionary:Open creative project", capability: "edit-video", permission: "filesystem" },
    { id: "copilotAssist", label: "Copilot Assist", command: "visionary:Assist with current composition", capability: "generate-video" },
    { id: "exportRender", label: "Queue Export", command: "visionary:Queue render export", capability: "edit-video", permission: "filesystem" },
  ],
  "architectural-designer": [
    { id: "createProject", label: "Design Villa", command: "agent:Create 6-bedroom villa design", capability: "create-architecture" },
  ],
  "interior-landscape": [
    { id: "createProject", label: "Interior Layout", command: "agent:Design interior layout", capability: "create-architecture" },
  ],
  "nasa-solver": [
    { id: "runAnalysis", label: "Solve Equation", command: "agent:Solve physics problem", capability: "scientific-simulation" },
  ],
  "quantum-trading": [
    { id: "runAnalysis", label: "Trading Signals", command: "agent:Show live trading signals", capability: "financial-analysis", permission: "network" },
  ],
  "digital-marketing-hub": [
    { id: "createProject", label: "Create Campaign", command: "agent:Generate marketing campaign", capability: "marketing-campaign" },
  ],
  omnimusic: [
    { id: "generateMusic", label: "Generate Music", command: "agent:Create a song", capability: "generate-music", permission: "microphone" },
  ],
  omnitranslator: [
    { id: "translate", label: "Translate", command: "agent:Translate this meeting", capability: "translate", permission: "microphone" },
  ],
  omnimap: [{ id: "navigate", label: "Navigate", capability: "navigation-maps", permission: "network" }],
  omnitv: [{ id: "stream", label: "Stream Channel", capability: "entertainment-streaming", permission: "network" }],
  omnimovies: [{ id: "stream", label: "Browse Catalog", capability: "entertainment-streaming", permission: "network" }],
};

const DEFAULT_ACTIONS: PluginActionDefinition[] = [
  { id: "open", label: "Open Tool" },
];

export function sovereignToolToPluginManifest(tool: SovereignToolDef): OmniPluginManifest {
  const capabilities = CAPABILITIES_BY_SLUG[tool.slug] ?? ["generate-code"];
  const actions = ACTIONS_BY_SLUG[tool.slug] ?? DEFAULT_ACTIONS;

  return {
    id: `sovereign-${tool.slug}`,
    name: tool.name,
    description: tool.description,
    icon: tool.icon,
    category: CATEGORY_BY_LAYOUT[tool.layout] ?? "utility",
    version: "12.0.0",
    author: "OmniMind",
    route: tool.href,
    workspace: tool.layout,
    toolId: tool.slug,
    permissions: PERMISSIONS_BY_SLUG[tool.slug] ?? ["filesystem", "network"],
    capabilities,
    actions,
    dependencies: [],
    featureFlags: Object.fromEntries(capabilities.map((c) => [c, "enabled" as const])),
    keyboardShortcuts: [
      { keys: "Ctrl+S", actionId: "save", label: "Save" },
      { keys: "Ctrl+K", actionId: "command_palette", label: "Command palette" },
    ],
    supportedInputs: ["prompt", "text", "file", "voice-transcript"],
    supportedOutputs: inferOutputs(tool.layout),
    keywords: [tool.slug.replace(/-/g, " "), tool.name.toLowerCase(), tool.tagline.toLowerCase()],
    routeId: tool.omniRouteId ?? tool.slug,
    apiProbe: tool.apiProbe,
    marketplace: {
      compatibility: "12.x",
      rating: 5,
    },
    minOmniVersion: "12.0.0",
  };
}

function inferOutputs(layout: string): string[] {
  if (layout.includes("analytics")) return ["report", "chart", "dataset"];
  if (layout.includes("medical")) return ["diagnosis", "report"];
  if (layout.includes("trading")) return ["signals", "chart"];
  if (layout.includes("vfx") || layout.includes("video")) return ["video", "timeline"];
  if (layout.includes("science")) return ["solution", "chart"];
  return ["text", "media", "code", "report"];
}

/** All sovereign workbench tools as installable plugin manifests. */
export function buildSovereignPluginManifests(): OmniPluginManifest[] {
  return SOVEREIGN_TOOLS.map(sovereignToolToPluginManifest);
}

/** Alias plugins for OmniForge specializations (no new routes). */
export function buildOmniForgeAliasManifests(): OmniPluginManifest[] {
  const base = sovereignToolToPluginManifest(SOVEREIGN_TOOLS.find((t) => t.slug === "omniforge-engine")!);
  return [
    {
      ...base,
      id: "alias-game-development",
      name: "Game Development",
      description: "Phaser, Unity-style game scaffolds and logic",
      route: "/omniforge-engine?stack=game",
      toolId: "game-development",
      capabilities: ["generate-code"],
      keywords: ["game", "phaser", "unity", "level", "sprite"],
    },
    {
      ...base,
      id: "alias-app-website-builder",
      name: "App & Website Builder",
      description: "React, Next.js, FastAPI full-stack apps",
      route: "/omniforge-engine?stack=web",
      toolId: "app-website-builder",
      capabilities: ["generate-code", "deploy"],
      keywords: ["react", "next", "website", "app", "fullstack"],
    },
    {
      ...base,
      id: "alias-business-website-builder",
      name: "Business Website Builder",
      description: "E-commerce, landing pages, perfume stores",
      route: "/omniforge-engine?stack=business",
      toolId: "business-website-builder",
      capabilities: ["generate-code", "deploy", "marketing-campaign"],
      keywords: ["perfume", "business", "store", "ecommerce", "landing"],
    },
  ];
}
