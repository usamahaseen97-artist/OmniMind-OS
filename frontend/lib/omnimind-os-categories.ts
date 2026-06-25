import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Cloud,
  Cpu,
  Hammer,
  Home,
  Map,
  MessageSquare,
  Settings,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Wand2,
  Gauge,
  FlaskConical,
} from "lucide-react";
import { SOVEREIGN_TOOLS, type SovereignToolDef, type SovereignToolSlug } from "./sovereign-tool-registry";

export type OmniOSCategoryId =
  | "platform"
  | "development"
  | "creative"
  | "business"
  | "medical"
  | "automation"
  | "cloud"
  | "marketplace"
  | "research"
  | "settings";

export type OmniOSSidebarItem = {
  id: string;
  slug?: SovereignToolSlug;
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
  status?: "live" | "beta" | "idle";
};

export type OmniOSSidebarCategory = {
  id: OmniOSCategoryId;
  label: string;
  description: string;
  icon: LucideIcon;
  items: OmniOSSidebarItem[];
};

const toolBySlug = Object.fromEntries(SOVEREIGN_TOOLS.map((t) => [t.slug, t])) as Record<
  SovereignToolSlug,
  SovereignToolDef
>;

function fromTools(slugs: SovereignToolSlug[], status: OmniOSSidebarItem["status"] = "live"): OmniOSSidebarItem[] {
  return slugs.map((slug) => {
    const t = toolBySlug[slug];
    return {
      id: slug,
      slug,
      name: t.name,
      description: t.description,
      href: t.href,
      icon: t.icon,
      status,
    };
  });
}

const PLATFORM_ITEMS: OmniOSSidebarItem[] = [
  {
    id: "neural-home",
    name: "Neural Command Center",
    description: "Home dashboard, chat, and quick launch",
    href: "/",
    icon: Sparkles,
    status: "live",
  },
  {
    id: "mission-control",
    name: "Mission Control",
    description: "AI operating center & system command",
    href: "/mission-control",
    icon: Gauge,
    status: "live",
  },
];

const AUTOMATION_ITEMS: OmniOSSidebarItem[] = [
  {
    id: "automation-engine",
    name: "Automation Engine",
    description: "Universal AI-native workflows",
    href: "/automation-engine",
    icon: Wand2,
    status: "live",
  },
];

const CLOUD_ITEMS: OmniOSSidebarItem[] = [
  {
    id: "omnicloud",
    name: "OmniCloud",
    description: "Cloud sync, storage, and remote execution",
    href: "/omnicloud",
    icon: Cloud,
    status: "live",
  },
];

const MARKETPLACE_ITEMS: OmniOSSidebarItem[] = [
  {
    id: "marketplace",
    name: "Extensions Marketplace",
    description: "Plugins, templates, and integrations",
    href: "/marketplace",
    icon: ShoppingBag,
    status: "beta",
  },
];

const SETTINGS_ITEMS: OmniOSSidebarItem[] = [
  {
    id: "settings",
    name: "Settings",
    description: "Theme, profiles, and preferences",
    href: "/?settings=1",
    icon: Settings,
    status: "live",
  },
];

/** Enterprise sidebar categories — single navigation source for OmniMind OS. */
export const OMNI_OS_CATEGORIES: OmniOSSidebarCategory[] = [
  {
    id: "platform",
    label: "Platform",
    description: "Command center & mission control",
    icon: Home,
    items: PLATFORM_ITEMS,
  },
  {
    id: "development",
    label: "Development",
    description: "Build, scaffold, and ship",
    icon: Hammer,
    items: fromTools(["omniforge-engine"]),
  },
  {
    id: "creative",
    label: "Creative",
    description: "Vision, VFX, marketing, spatial design",
    icon: Wand2,
    items: fromTools([
      "creative-visionary",
      "vfx-master",
      "digital-marketing-hub",
      "interior-landscape",
      "architectural-designer",
    ]),
  },
  {
    id: "business",
    label: "Business",
    description: "Analytics, trading, operations",
    icon: TrendingUp,
    items: fromTools(["business-analytics", "quantum-trading"]),
  },
  {
    id: "medical",
    label: "Medical",
    description: "Diagnostic intelligence",
    icon: Stethoscope,
    items: fromTools(["medical-diagnostic"]),
  },
  {
    id: "automation",
    label: "Automation",
    description: "Workflows and agents",
    icon: Cpu,
    items: AUTOMATION_ITEMS,
  },
  {
    id: "cloud",
    label: "Cloud",
    description: "Deploy and infrastructure",
    icon: Cloud,
    items: CLOUD_ITEMS,
  },
  {
    id: "marketplace",
    label: "Marketplace",
    description: "Extensions and templates",
    icon: ShoppingBag,
    items: MARKETPLACE_ITEMS,
  },
  {
    id: "research",
    label: "Research",
    description: "Science, maps, and media intelligence",
    icon: FlaskConical,
    items: fromTools(["nasa-solver", "omnimap", "omnimusic", "omnitv", "omnimovies", "omnitranslator"]),
  },
  {
    id: "settings",
    label: "Settings",
    description: "System preferences",
    icon: Settings,
    items: SETTINGS_ITEMS,
  },
];

export function flattenOmniOSSidebarItems(): OmniOSSidebarItem[] {
  const seen = new Set<string>();
  const out: OmniOSSidebarItem[] = [];
  for (const cat of OMNI_OS_CATEGORIES) {
    for (const item of cat.items) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      out.push(item);
    }
  }
  return out;
}
