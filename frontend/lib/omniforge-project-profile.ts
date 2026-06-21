/** Unified OmniForge project targets (merged app / game / business builders). */

export type OmniForgeTargetStack = "polyglot" | "web" | "game" | "business";

export const OMNIFORGE_TARGET_STACKS: {
  id: OmniForgeTargetStack;
  label: string;
  description: string;
  legacyRoutes: string[];
}[] = [
  {
    id: "polyglot",
    label: "Polyglot",
    description: "JS/TS · Python · Dart · C#",
    legacyRoutes: [],
  },
  {
    id: "web",
    label: "App & Web",
    description: "Next.js · APIs · mobile web",
    legacyRoutes: ["app-and-develop", "app-builder"],
  },
  {
    id: "game",
    label: "Game Dev",
    description: "Unity · canvas · C# gameplay",
    legacyRoutes: ["game-app-architect", "game-dev"],
  },
  {
    id: "business",
    label: "Business Site",
    description: "ERP · CRM · landing systems",
    legacyRoutes: ["business-software-architect", "business-site-maker"],
  },
];

export function targetStackFromLegacyRoute(routeId: string): OmniForgeTargetStack {
  for (const stack of OMNIFORGE_TARGET_STACKS) {
    if (stack.legacyRoutes.includes(routeId)) return stack.id;
  }
  return "polyglot";
}

const VALID_STACKS = new Set<OmniForgeTargetStack>(["polyglot", "web", "game", "business"]);

export function parseTargetStackParam(value: string | null | undefined): OmniForgeTargetStack | null {
  if (!value || !VALID_STACKS.has(value as OmniForgeTargetStack)) return null;
  return value as OmniForgeTargetStack;
}

export function apiTargetStack(stack: OmniForgeTargetStack): string {
  if (stack === "game") return "game";
  if (stack === "business") return "business";
  if (stack === "web") return "web";
  return "polyglot";
}
