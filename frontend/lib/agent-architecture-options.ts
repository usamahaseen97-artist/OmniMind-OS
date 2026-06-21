import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  Clapperboard,
  Film,
  Globe,
  Hammer,
  LayoutDashboard,
  Map,
  Megaphone,
  Palette,
  Sparkles,
  Stethoscope,
  TrendingUp,
} from "lucide-react";
import type { OmniRouteId } from "./omni-tools";
import { getOmniTool } from "./omni-tools";

export type AgentArchitectureOption = {
  id: OmniRouteId;
  label: string;
  description: string;
  icon: LucideIcon;
  /** Hover badge — exact system role */
  systemRole: string;
  /** Button line after selection, e.g. "Quantum Trading Engine" */
  activeTitle: string;
  /** Large neon header in Live Sandbox */
  deckTitle: string;
};

/** Fourteen sovereign agent architectures for the selector + sandbox projection. */
export const AGENT_ARCHITECTURE_OPTIONS: AgentArchitectureOption[] = [
  {
    id: "dashboard",
    label: "Neural Chatbot",
    description: "Gemini-class Q&A · notes · files · images · error fixes",
    icon: LayoutDashboard,
    systemRole: "Multimodal Neural Assistant",
    activeTitle: "Neural Chatbot Engine",
    deckTitle: "Neural Chatbot",
  },
  {
    id: "omniforge-engine",
    label: "OmniForge Engine",
    description: "App · Game · Business — unified polyglot IDE",
    icon: Hammer,
    systemRole: "Cross-Environment Build Engine",
    activeTitle: "OmniForge Engine",
    deckTitle: "OmniForge Engine",
  },
  {
    id: "marketing-ad-king",
    label: "Marketing & Ads",
    description: "Campaigns · creatives · social packs",
    icon: Megaphone,
    systemRole: "Growth & Ad Intelligence",
    activeTitle: "Marketing Engine",
    deckTitle: "Marketing & Ads",
  },
  {
    id: "ai-omnimaps",
    label: "OmniMap Navigator",
    description: "Smart maps · pins · voice navigation",
    icon: Map,
    systemRole: "Geo-Spatial Intelligence",
    activeTitle: "OmniMap Engine",
    deckTitle: "OmniMap Navigator",
  },
  {
    id: "vfx-editor",
    label: "VFX Editor",
    description: "Scene cuts · compositing · effects",
    icon: Film,
    systemRole: "Cinematic Compositing Node",
    activeTitle: "VFX Editor Engine",
    deckTitle: "VFX Editor",
  },
  {
    id: "medical-diagnostic",
    label: "Medical Diagnostic",
    description: "Clinical imaging · triage reports",
    icon: Stethoscope,
    systemRole: "Clinical Analysis Module",
    activeTitle: "Medical Diagnostic Engine",
    deckTitle: "Medical Diagnostic",
  },
  {
    id: "quantum-trading",
    label: "Quantum Trading",
    description: "Live charts · signals · market oracle",
    icon: TrendingUp,
    systemRole: "Quantitative Market Oracle",
    activeTitle: "Quantum Trading Engine",
    deckTitle: "Quantum Trading",
  },
  {
    id: "business-analytics",
    label: "Business Analytics",
    description: "Dashboards · pandas · insights",
    icon: BarChart3,
    systemRole: "Data Intelligence Layer",
    activeTitle: "Business Analytics Engine",
    deckTitle: "Business Analytics",
  },
  {
    id: "architectural-designer",
    label: "Architectural Design",
    description: "Blueprints · 3D layouts · plots",
    icon: Building2,
    systemRole: "Spatial Blueprint Generator",
    activeTitle: "Architectural Design Engine",
    deckTitle: "Architectural Design",
  },
  {
    id: "vfx-master",
    label: "VFX Master",
    description: "Pro pipeline · auto-editor chains",
    icon: Clapperboard,
    systemRole: "Pro Video Pipeline Core",
    activeTitle: "VFX Master Engine",
    deckTitle: "VFX Master",
  },
  {
    id: "meta-agent",
    label: "Meta-Agent",
    description: "Routes all sovereign modules",
    icon: Sparkles,
    systemRole: "Multi-Agent Router",
    activeTitle: "Meta-Agent Engine",
    deckTitle: "Meta-Agent",
  },
];

export function getAgentArchitectureOption(id: string): AgentArchitectureOption {
  const found = AGENT_ARCHITECTURE_OPTIONS.find((o) => o.id === id);
  if (found) return found;
  const tool = getOmniTool(id);
  return {
    id: tool.id as OmniRouteId,
    label: tool.name,
    description: tool.description,
    icon: tool.icon,
    systemRole: tool.tagline,
    activeTitle: `${tool.name} Engine`,
    deckTitle: tool.name,
  };
}
