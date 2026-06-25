import type { CommandPaletteItem } from "./omnimind-ecosystem-registry";
import { COMMAND_PALETTE_ITEMS } from "./omnimind-ecosystem-registry";
import { SOVEREIGN_TOOLS } from "./sovereign-tool-registry";

/** Extended palette — ecosystem commands + all sovereign tools. */
export const OMNI_OS_COMMAND_ITEMS: CommandPaletteItem[] = [
  ...COMMAND_PALETTE_ITEMS,
  ...SOVEREIGN_TOOLS.map((t) => ({
    id: `open-${t.slug}`,
    label: `Open ${t.name}`,
    group: "Tools",
    keywords: `${t.slug} ${t.tagline} ${t.description}`.toLowerCase(),
    action: "navigate" as const,
    href: t.href,
  })),
  {
    id: "open-home",
    label: "Neural Chatbot Home",
    group: "Navigation",
    keywords: "home chat neural dashboard",
    action: "navigate",
    href: "/",
  },
];
