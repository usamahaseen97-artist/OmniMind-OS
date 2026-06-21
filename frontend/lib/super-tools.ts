import type { LucideIcon } from "lucide-react";
import { BrainCircuit, Map, Megaphone, Rocket } from "lucide-react";

export type SuperTool = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  accent: "cyan" | "violet" | "fuchsia" | "emerald";
};

export const SUPER_TOOLS: SuperTool[] = [
  {
    id: "nasa-science-solver",
    name: "NASA Science Solver",
    tagline: "High-reasoning physics & space",
    description: "Wireless energy, orbital data, advanced physics",
    icon: Rocket,
    accent: "cyan",
  },
  {
    id: "marketing-ad-king",
    name: "Marketing & Ad King",
    tagline: "Creative suite & social posts",
    description: "Strategy, captions, image/video placeholders",
    icon: Megaphone,
    accent: "fuchsia",
  },
  {
    id: "ai-omnimaps",
    name: "AI OmniMaps",
    tagline: "Smart local discovery",
    description: "Reviews, ratings, neon map pins, voice drive mode",
    icon: Map,
    accent: "emerald",
  },
  {
    id: "business-software-architect",
    name: "Business Software Architect",
    tagline: "ERP · CRM · AI workforce",
    description: "Build software, agents, digital clones",
    icon: BrainCircuit,
    accent: "violet",
  },
];

export function getSuperToolById(id: string) {
  return SUPER_TOOLS.find((t) => t.id === id) ?? SUPER_TOOLS[0];
}
