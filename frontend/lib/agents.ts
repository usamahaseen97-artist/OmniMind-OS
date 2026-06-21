import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  Clapperboard,
  Globe,
  Palette,
  Sparkles,
  Stethoscope,
  TrendingUp,
} from "lucide-react";

export type MetaAgent = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
};

export const META_AGENTS: MetaAgent[] = [
  {
    id: "creative-visionary",
    name: "Creative Video",
    description: "Text-to-video & image-to-video",
    icon: Palette,
  },
  {
    id: "video-vfx",
    name: "Video VFX Master",
    description: "Auto-editor & scene cuts",
    icon: Clapperboard,
  },
  {
    id: "architect",
    name: "Architectural Intelligence",
    description: "3D layouts from plot & rooms",
    icon: Building2,
  },
  {
    id: "data-science",
    name: "Business Analytics",
    description: "Pandas · charts · insights",
    icon: BarChart3,
  },
  {
    id: "trade-oracle",
    name: "Quantum Trader",
    description: "Live market signals",
    icon: TrendingUp,
  },
  {
    id: "medical-specialist",
    name: "Medical Specialist",
    description: "Vision & report analysis",
    icon: Stethoscope,
  },
  {
    id: "web-architect",
    name: "App / Web Architect",
    description: "Next.js · Supabase · Expo",
    icon: Globe,
  },
  {
    id: "sovereign-core",
    name: "Neural Chatbot",
    description: "Multimodal Q&A orchestrator",
    icon: Sparkles,
  },
];

export function getAgentById(id: string) {
  return META_AGENTS.find((a) => a.id === id) ?? META_AGENTS[META_AGENTS.length - 1];
}
