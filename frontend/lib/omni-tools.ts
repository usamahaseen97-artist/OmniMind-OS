import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BrainCircuit,
  Building2,
  Clapperboard,
  Film,
  Gamepad2,
  Globe,
  History,
  Info,
  LayoutDashboard,
  Map,
  Megaphone,
  Rocket,
  Settings,
  Sparkles,
  Stethoscope,
  TrendingUp,
} from "lucide-react";

export type OmniRouteId =
  | "dashboard"
  | "omniforge-engine"
  | "app-and-develop"
  | "ai-omnimaps"
  | "business-software-architect"
  | "marketing-ad-king"
  | "nasa-science-solver"
  | "vfx-editor"
  | "creative-visionary"
  | "vfx-master"
  | "architectural-designer"
  | "business-analytics"
  | "quantum-trading"
  | "medical-diagnostic"
  | "game-app-architect"
  | "meta-agent"
  | "system-modules"
  | "neural-history"
  | "about";

export type ToolKind =
  | "dashboard"
  | "workbench"
  | "custom-split"
  | "about"
  | "history"
  | "system";

export type OmniTool = {
  id: OmniRouteId;
  name: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  kind: ToolKind;
  agentId: string;
  accent: "cyan" | "violet" | "fuchsia" | "emerald" | "green" | "amber";
};

export const OMNI_TOOLS: OmniTool[] = [
  {
    id: "dashboard",
    name: "Neural Chatbot",
    tagline: "Gemini-class assistant",
    description: "Q&A · notes · file analysis · /image · bug fixes",
    icon: LayoutDashboard,
    kind: "dashboard",
    agentId: "sovereign-core",
    accent: "green",
  },
  {
    id: "omniforge-engine",
    name: "OmniForge Engine",
    tagline: "App · Game · Business unified IDE",
    description: "Next.js · Unity · ERP — one polyglot workbench",
    icon: Globe,
    kind: "workbench",
    agentId: "web-architect",
    accent: "cyan",
  },
  {
    id: "ai-omnimaps",
    name: "OmniMap",
    tagline: "Smart maps & voice drive",
    description: "Reviews · pins · navigation",
    icon: Map,
    kind: "custom-split",
    agentId: "ai-omnimaps",
    accent: "emerald",
  },
  {
    id: "marketing-ad-king",
    name: "Marketing & Ad King",
    tagline: "Ads & social posts",
    description: "Strategy · captions · creatives",
    icon: Megaphone,
    kind: "custom-split",
    agentId: "marketing-ad-king",
    accent: "fuchsia",
  },
  {
    id: "nasa-science-solver",
    name: "NASA Science Solver",
    tagline: "Physics & space AI",
    description: "High-reasoning science problems",
    icon: Rocket,
    kind: "custom-split",
    agentId: "nasa-science-solver",
    accent: "cyan",
  },
  {
    id: "vfx-editor",
    name: "VFX Editor",
    tagline: "Scene editing",
    description: "Cuts · effects · compositing",
    icon: Film,
    kind: "workbench",
    agentId: "video-vfx",
    accent: "violet",
  },
  {
    id: "vfx-master",
    name: "VFX Master",
    tagline: "Pro video pipeline",
    description: "Auto-editor · VFX chains",
    icon: Clapperboard,
    kind: "workbench",
    agentId: "video-vfx",
    accent: "violet",
  },
  {
    id: "architectural-designer",
    name: "Architectural Designer",
    tagline: "3D layouts",
    description: "Plot · rooms · blueprints",
    icon: Building2,
    kind: "workbench",
    agentId: "architect",
    accent: "cyan",
  },
  {
    id: "business-analytics",
    name: "Business Analytics",
    tagline: "Data intelligence",
    description: "Charts · pandas · insights",
    icon: BarChart3,
    kind: "workbench",
    agentId: "data-science",
    accent: "emerald",
  },
  {
    id: "quantum-trading",
    name: "Quantum Trading",
    tagline: "Market oracle",
    description: "Signals · live finance",
    icon: TrendingUp,
    kind: "workbench",
    agentId: "trade-oracle",
    accent: "amber",
  },
  {
    id: "medical-diagnostic",
    name: "Medical Diagnostic",
    tagline: "Clinical AI",
    description: "Scans · reports · triage",
    icon: Stethoscope,
    kind: "workbench",
    agentId: "medical-specialist",
    accent: "emerald",
  },
  {
    id: "meta-agent",
    name: "META-AGENT",
    tagline: "Master orchestrator",
    description: "Routes all sovereign modules",
    icon: Sparkles,
    kind: "workbench",
    agentId: "sovereign-core",
    accent: "green",
  },
  {
    id: "system-modules",
    name: "System Modules",
    tagline: "Integrations hub",
    description: "API keys · engines · status",
    icon: Settings,
    kind: "system",
    agentId: "sovereign-core",
    accent: "cyan",
  },
  {
    id: "neural-history",
    name: "Neural History",
    tagline: "Memory vault",
    description: "Past chats & sessions",
    icon: History,
    kind: "history",
    agentId: "sovereign-core",
    accent: "violet",
  },
  {
    id: "about",
    name: "About",
    tagline: "OmniMind OS specs",
    description: "Tools · system · how it works",
    icon: Info,
    kind: "about",
    agentId: "sovereign-core",
    accent: "cyan",
  },
];

const OMNI_ROUTE_ALIASES: Partial<Record<string, OmniRouteId>> = {
  "app-and-develop": "omniforge-engine",
  "game-app-architect": "omniforge-engine",
  "business-software-architect": "omniforge-engine",
};

export function getOmniTool(id: string): OmniTool {
  const resolved = OMNI_ROUTE_ALIASES[id as OmniRouteId] ?? id;
  return OMNI_TOOLS.find((t) => t.id === resolved) ?? OMNI_TOOLS[0];
}

export function isDashboard(id: string) {
  return id === "dashboard";
}

export function isCustomSplitTool(id: string) {
  return getOmniTool(id).kind === "custom-split";
}

export function isWorkbenchTool(id: string) {
  return getOmniTool(id).kind === "workbench";
}

/** Menu order for sidebar (excludes dashboard at top separately) */
export const SIDEBAR_TOOLS = OMNI_TOOLS.filter((t) => t.id !== "dashboard");
