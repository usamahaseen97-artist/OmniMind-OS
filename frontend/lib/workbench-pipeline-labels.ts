import { getOmniTool } from "./omni-tools";
import { getSovereignTool } from "./sovereign-tool-registry";

const PIPELINE_OVERRIDES: Record<string, string> = {
  "vfx-master": "VFX Master — PRO VIDEO PIPELINE",
  "creative-visionary": "Creative Visionary — NEURAL MEDIA PIPELINE",
  "digital-marketing-hub": "Digital Marketing Hub — AD PRODUCTION PIPELINE",
  "game-dev": "Game Development — ENGINE PIPELINE",
  "app-builder": "App & Websites — FULL-STACK PIPELINE",
  "business-site-maker": "Business Website — MONETIZATION PIPELINE",
  "architectural-designer": "Architectural External — SPATIAL PIPELINE",
  "interior-landscape": "Interior Design — COMPOSITION PIPELINE",
};

export function getWorkbenchPipelineLabel(toolSlug: string, routeId: string): string {
  if (PIPELINE_OVERRIDES[toolSlug]) return PIPELINE_OVERRIDES[toolSlug];
  const sovereign = getSovereignTool(toolSlug);
  const omni = getOmniTool(routeId);
  const name = sovereign?.name ?? omni?.name ?? "Agent";
  const tagline = (sovereign?.tagline ?? omni?.tagline ?? "pipeline").toUpperCase();
  return `${name} — ${tagline}`;
}
