import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  Clapperboard,
  Film,
  Hammer,
  Home,
  Languages,
  Map,
  Megaphone,
  Music,
  Rocket,
  Stethoscope,
  TrendingUp,
  Tv,
  Wand2,
  Hospital,
  Palette,
} from "lucide-react";

export type SovereignToolSlug =
  | "omniforge-engine"
  | "architectural-designer"
  | "interior-landscape"
  | "medical-diagnostic"
  | "medical-diagnostic-suite"
  | "quantum-trading"
  | "creative-visionary"
  | "business-analytics"
  | "vfx-master"
  | "nasa-solver"
  | "digital-marketing-hub"
  | "omnimap"
  | "omnimusic"
  | "omnitv"
  | "omnimovies"
  | "omnitranslator"
  | "visionary-studio";

export type SovereignLayoutKind =
  | "architect-split"
  | "design-split"
  | "medical-split"
  | "clinical-enterprise"
  | "trading-terminal"
  | "video-suite"
  | "analytics-dashboard"
  | "vfx-timeline"
  | "science-console"
  | "marketing-hub"
  | "visionary-enterprise"
  | "entertainment-full"
  | "omnimusic-daw"
  | "map-full"
  | "translator-dual";

export type SovereignToolDef = {
  slug: SovereignToolSlug;
  href: `/${SovereignToolSlug}`;
  name: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  layout: SovereignLayoutKind;
  /** Maps to OmniChatShell / backend agent when applicable */
  omniRouteId?: string;
  apiProbe?: string;
};

/** Exactly 16 sovereign tools — order matches sidebar. */
export const SOVEREIGN_TOOLS: SovereignToolDef[] = [
  {
    slug: "omniforge-engine",
    href: "/omniforge-engine",
    name: "OMNI WEB DEVELOPMENT",
    tagline: "OmniForge Engine · unified polyglot IDE",
    description: "Merged app, game, and business builders — AI agent, Monaco, terminal, live preview",
    icon: Hammer,
    layout: "architect-split",
    omniRouteId: "omniforge-engine",
    apiProbe: "/api/v1/build-engine/omniforge/scaffold",
  },
  {
    slug: "architectural-designer",
    href: "/architectural-designer",
    name: "Architectural External Design",
    tagline: "Exterior massing · elevations · landscape",
    description: "External architecture, skeletal massing, materials, and landscape assets",
    icon: Home,
    layout: "design-split",
    omniRouteId: "architectural-designer",
    apiProbe: "/api/v1/spatial/blueprint",
  },
  {
    slug: "interior-landscape",
    href: "/interior-landscape",
    name: "Interior Design",
    tagline: "Indoor composition · materials · lighting",
    description: "Furniture layouts, partitions, materials, and cinematic indoor lighting",
    icon: Home,
    layout: "design-split",
    omniRouteId: "architectural-designer",
    apiProbe: "/api/v1/spatial/blueprint",
  },
  {
    slug: "medical-diagnostic",
    href: "/medical-diagnostic",
    name: "Medical Diagnostic Agent",
    tagline: "Vision · labs · triage",
    description: "Scan reports, vitals, and AI-assisted diagnostics",
    icon: Stethoscope,
    layout: "medical-split",
    omniRouteId: "medical-diagnostic",
    apiProbe: "/api/agents/medical/triage",
  },
  {
    slug: "medical-diagnostic-suite",
    href: "/medical-diagnostic",
    name: "Medical Diagnostic Enterprise Suite",
    tagline: "Clinical workspace · CDS · enterprise",
    description: "Hospital-grade clinical decision-support workspace for qualified healthcare professionals",
    icon: Hospital,
    layout: "clinical-enterprise",
    omniRouteId: "medical-diagnostic-suite",
    apiProbe: "/api/v1/medical-enterprise/patients",
  },
  {
    slug: "quantum-trading",
    href: "/quantum-trading",
    name: "Quantum Trading Agent",
    tagline: "Live signals · risk",
    description: "AI trading assistant with mock exchange hooks",
    icon: TrendingUp,
    layout: "trading-terminal",
    omniRouteId: "quantum-trading",
    apiProbe: "/api/v1/finance/signals",
  },
  {
    slug: "creative-visionary",
    href: "/creative-visionary",
    name: "Creative Visionary Studio",
    tagline: "Video scenes · ultra-realistic images",
    description: "Centralized generative media studio for cinematic video and batch image synthesis",
    icon: Clapperboard,
    layout: "video-suite",
    omniRouteId: "creative-visionary",
    apiProbe: "/api/v1/tools/video/generate",
  },
  {
    slug: "visionary-studio",
    href: "/creative-visionary",
    name: "Visionary Studio",
    tagline: "Unified AI Creative OS · Adobe-class workspace",
    description: "Professional multi-track creative operating system — image, video, VFX, brand, 3D, and social production",
    icon: Palette,
    layout: "visionary-enterprise",
    omniRouteId: "visionary-studio",
    apiProbe: "/api/v1/visionary/project",
  },
  {
    slug: "business-analytics",
    href: "/business-analytics",
    name: "Business Analytics Server",
    tagline: "Spark · BI · exports",
    description: "Big data dashboards and natural-language data ops",
    icon: BarChart3,
    layout: "analytics-dashboard",
    omniRouteId: "business-analytics",
    apiProbe: "/api/v1/user/telemetry/async",
  },
  {
    slug: "vfx-master",
    href: "/vfx-master",
    name: "VFX Master Editor",
    tagline: "Timeline · AI cuts",
    description: "Multi-track editor with smart retention edits",
    icon: Wand2,
    layout: "vfx-timeline",
    omniRouteId: "vfx-master",
    apiProbe: "/api/v1/tools/dispatch",
  },
  {
    slug: "nasa-solver",
    href: "/nasa-solver",
    name: "NASA Science Solver",
    tagline: "Physics · aerospace math",
    description: "Advanced equations and engineering optimization",
    icon: Rocket,
    layout: "science-console",
    omniRouteId: "nasa-science-solver",
    apiProbe: "/science/solve",
  },
  {
    slug: "digital-marketing-hub",
    href: "/digital-marketing-hub",
    name: "Digital Marketing Hub",
    tagline: "Campaigns · ads · social",
    description: "Dual-viewport ad studio — image + video with integrated social copy",
    icon: Megaphone,
    layout: "marketing-hub",
    omniRouteId: "marketing-ad-king",
    apiProbe: "/marketing/posts",
  },
  {
    slug: "omnimap",
    href: "/omnimap",
    name: "OmniMap",
    tagline: "Maps · voice drive",
    description: "Full-screen maps with ratings and routing",
    icon: Map,
    layout: "map-full",
    omniRouteId: "ai-omnimaps",
    apiProbe: "/maps/places",
  },
  {
    slug: "omnimusic",
    href: "/omnimusic",
    name: "OmniMusic Studio",
    tagline: "DAW · arrangement · mix",
    description: "Professional digital audio workstation — timeline, piano roll, mixer, plugins, and export",
    icon: Music,
    layout: "omnimusic-daw",
    apiProbe: "/api/v1/omnimusic/studio/projects/daw-proj-001",
  },
  {
    slug: "omnitv",
    href: "/omnitv",
    name: "OmniTV",
    tagline: "Live channels · highlights",
    description: "News, sports, dramas, and cultural streams",
    icon: Tv,
    layout: "entertainment-full",
    apiProbe: "/api/v1/tv/grid",
  },
  {
    slug: "omnimovies",
    href: "/omnimovies",
    name: "OmniMovies",
    tagline: "Cinema · recommendations",
    description: "Netflix-style catalog with Kafka-powered rows",
    icon: Film,
    layout: "entertainment-full",
    apiProbe: "/api/v1/movies/catalog",
  },
  {
    slug: "omnitranslator",
    href: "/omnitranslator",
    name: "OmniTranslator",
    tagline: "Real-time bilingual bridge",
    description: "Speech capture, instant translation, dual readouts",
    icon: Languages,
    layout: "translator-dual",
    apiProbe: "/translate/languages",
  },
];

/** 11 primary workbench tools for the IDE matrix UI */
export const PRIMARY_WORKBENCH_SLUGS: SovereignToolSlug[] = [
  "omniforge-engine",
  "architectural-designer",
  "interior-landscape",
  "medical-diagnostic",
  "quantum-trading",
  "creative-visionary",
  "business-analytics",
  "vfx-master",
  "nasa-solver",
  "digital-marketing-hub",
];

export const PRIMARY_WORKBENCH_TOOLS = PRIMARY_WORKBENCH_SLUGS.map(
  (slug) => SOVEREIGN_TOOLS.find((t) => t.slug === slug)!,
);

export function getSovereignTool(slug: string): SovereignToolDef | undefined {
  const aliases: Record<string, SovereignToolSlug> = {
    "game-dev": "omniforge-engine",
    "app-builder": "omniforge-engine",
    "business-site-maker": "omniforge-engine",
    "visionary-studio": "creative-visionary",
    "medical-diagnostic-suite": "medical-diagnostic",
  };
  const resolved = aliases[slug] ?? slug;
  return SOVEREIGN_TOOLS.find((t) => t.slug === resolved);
}

/** Resolve legacy OmniRouteId → sovereign tool definition (full workbench UI). */
export function sovereignToolByOmniRoute(routeId: string): SovereignToolDef | undefined {
  const direct = SOVEREIGN_TOOLS.find((t) => t.omniRouteId === routeId);
  if (direct) return direct;
  if (routeId === "business-software-architect" || routeId === "game-app-architect" || routeId === "app-and-develop") {
    return getSovereignTool("omniforge-engine");
  }
  if (routeId === "vfx-editor") return getSovereignTool("vfx-master");
  return undefined;
}

export function isSovereignToolSlug(slug: string): slug is SovereignToolSlug {
  return SOVEREIGN_TOOLS.some((t) => t.slug === slug);
}
