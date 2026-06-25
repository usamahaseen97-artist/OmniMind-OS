import type { SovereignToolDef } from "../../lib/sovereign-tool-registry";
import { SOVEREIGN_TOOLS } from "../../lib/sovereign-tool-registry";
import { globalToolRegistry } from "../agent/ToolRegistry";
import type { ToolCategory, UniversalToolDefinition, UniversalToolPrompt } from "./types";

const CATEGORY_BY_LAYOUT: Record<string, ToolCategory> = {
  "architect-split": "development",
  "analytics-dashboard": "analytics",
  "medical-split": "medical",
  "trading-terminal": "finance",
  "vfx-timeline": "creative",
  "video-suite": "creative",
  "science-console": "science",
  "marketing-hub": "marketing",
  "entertainment-full": "entertainment",
  "map-full": "utility",
  "translator-dual": "utility",
  "design-split": "creative",
};

const DEFAULT_PROMPTS: UniversalToolPrompt[] = [
  { id: "analyze", label: "Analyze", template: "Analyze the current workspace and summarize key findings." },
  { id: "improve", label: "Improve", template: "Suggest improvements for the current output." },
  { id: "export", label: "Export", template: "Prepare an export bundle for this project." },
];

const DEFAULT_SHORTCUTS = [
  { keys: "Ctrl+S", actionId: "save", label: "Save" },
  { keys: "Ctrl+Z", actionId: "undo", label: "Undo" },
  { keys: "Ctrl+Shift+Z", actionId: "redo", label: "Redo" },
  { keys: "Ctrl+K", actionId: "command_palette", label: "Command palette" },
];

export function sovereignToUniversalTool(tool: SovereignToolDef): UniversalToolDefinition {
  const agentDef = globalToolRegistry.get(tool.slug);
  const agentActions = agentDef?.actions ?? [];

  return {
    toolId: tool.slug,
    title: tool.name,
    description: tool.description,
    icon: tool.icon,
    category: CATEGORY_BY_LAYOUT[tool.layout] ?? "utility",
    capabilities: agentDef?.capabilities ?? [tool.layout, tool.tagline, ...(tool.omniRouteId ? [tool.omniRouteId] : [])],
    acceptedInputs: agentDef?.supportedInputs ?? ["prompt", "text", "file", "voice-transcript"],
    generatedOutputs: agentDef?.supportedOutputs ?? inferOutputs(tool.layout),
    supportedActions: agentActions.map((a) => ({
      id: a.id,
      label: a.label,
      command: a.command,
      permission: "execute" as const,
    })),
    permissions: agentDef?.permissions ?? ["read", "write", "execute"],
    keyboardShortcuts: DEFAULT_SHORTCUTS,
    aiPrompts: DEFAULT_PROMPTS,
    href: tool.href,
    routeId: tool.omniRouteId ?? tool.slug,
    pluginId: agentDef?.pluginId ?? "core",
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

/** Central universal tool registry — sovereign tools + plugins. */
export class UniversalToolRegistry {
  private tools = new Map<string, UniversalToolDefinition>();

  constructor() {
    for (const t of SOVEREIGN_TOOLS) {
      const def = sovereignToUniversalTool(t);
      this.tools.set(def.toolId, def);
    }
  }

  register(tool: UniversalToolDefinition) {
    this.tools.set(tool.toolId, tool);
  }

  get(toolId: string): UniversalToolDefinition | undefined {
    return this.tools.get(toolId);
  }

  list(): UniversalToolDefinition[] {
    return [...this.tools.values()];
  }

  byCategory(category: ToolCategory): UniversalToolDefinition[] {
    return this.list().filter((t) => t.category === category);
  }
}

let singleton: UniversalToolRegistry | null = null;

export function getUniversalToolRegistry(): UniversalToolRegistry {
  if (!singleton) singleton = new UniversalToolRegistry();
  return singleton;
}

export function getUniversalTool(toolId: string): UniversalToolDefinition | undefined {
  return getUniversalToolRegistry().get(toolId);
}
