import type { SovereignToolSlug } from "./sovereign-tool-registry";

/** Module groups A–I — drives dynamic workspace chrome per tool */
export type WorkbenchModuleGroup = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "generic";

export type WorkbenchLayoutFlags = {
  showLeftExplorer: boolean;
  showLiveSim: boolean;
  showCodeBot: boolean;
  showBottomTerminal: boolean;
  showFilesToggle: boolean;
  fullIdeMode: boolean;
};

export const ACTIVITY_MENU_GROUPS: {
  label: string;
  slugs: SovereignToolSlug[];
}[] = [
  {
    label: "Build & Deploy Infrastructure",
    slugs: ["omniforge-engine"],
  },
  {
    label: "Spatial Design Workspace",
    slugs: ["architectural-designer", "interior-landscape"],
  },
  {
    label: "Computational Intelligence",
    slugs: ["medical-diagnostic", "quantum-trading", "business-analytics", "nasa-solver"],
  },
  {
    label: "Multimedia Production",
    slugs: ["creative-visionary", "vfx-master", "digital-marketing-hub"],
  },
];

const GROUP_BY_SLUG: Record<SovereignToolSlug, WorkbenchModuleGroup> = {
  "omniforge-engine": "A",
  "architectural-designer": "B",
  "interior-landscape": "B",
  "nasa-solver": "C",
  "medical-diagnostic": "D",
  "quantum-trading": "E",
  "business-analytics": "F",
  "creative-visionary": "G",
  "vfx-master": "H",
  "digital-marketing-hub": "I",
  omnimap: "generic",
  omnimusic: "generic",
  omnitv: "generic",
  omnimovies: "generic",
  omnitranslator: "generic",
};

const FLAGS: Record<WorkbenchModuleGroup, WorkbenchLayoutFlags> = {
  A: {
    showLeftExplorer: true,
    showLiveSim: true,
    showCodeBot: true,
    showBottomTerminal: true,
    showFilesToggle: true,
    fullIdeMode: true,
  },
  B: {
    showLeftExplorer: false,
    showLiveSim: false,
    showCodeBot: false,
    showBottomTerminal: false,
    showFilesToggle: false,
    fullIdeMode: false,
  },
  C: {
    showLeftExplorer: false,
    showLiveSim: false,
    showCodeBot: false,
    showBottomTerminal: false,
    showFilesToggle: false,
    fullIdeMode: false,
  },
  D: {
    showLeftExplorer: false,
    showLiveSim: false,
    showCodeBot: false,
    showBottomTerminal: false,
    showFilesToggle: false,
    fullIdeMode: false,
  },
  E: {
    showLeftExplorer: false,
    showLiveSim: false,
    showCodeBot: true,
    showBottomTerminal: false,
    showFilesToggle: false,
    fullIdeMode: false,
  },
  F: {
    showLeftExplorer: false,
    showLiveSim: false,
    showCodeBot: true,
    showBottomTerminal: false,
    showFilesToggle: false,
    fullIdeMode: false,
  },
  G: {
    showLeftExplorer: false,
    showLiveSim: false,
    showCodeBot: true,
    showBottomTerminal: false,
    showFilesToggle: false,
    fullIdeMode: false,
  },
  H: {
    showLeftExplorer: false,
    showLiveSim: false,
    showCodeBot: true,
    showBottomTerminal: false,
    showFilesToggle: false,
    fullIdeMode: false,
  },
  I: {
    showLeftExplorer: false,
    showLiveSim: false,
    showCodeBot: false,
    showBottomTerminal: false,
    showFilesToggle: false,
    fullIdeMode: false,
  },
  generic: {
    showLeftExplorer: false,
    showLiveSim: true,
    showCodeBot: false,
    showBottomTerminal: false,
    showFilesToggle: false,
    fullIdeMode: false,
  },
};

export function getModuleGroup(slug: SovereignToolSlug): WorkbenchModuleGroup {
  return GROUP_BY_SLUG[slug] ?? "generic";
}

export function getLayoutFlags(slug: SovereignToolSlug): WorkbenchLayoutFlags {
  return FLAGS[getModuleGroup(slug)];
}
