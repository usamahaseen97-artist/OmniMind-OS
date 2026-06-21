"use client";

import type { SovereignToolDef } from "../../../lib/sovereign-tool-registry";
import { ToolLiveSimDesign } from "../matrix/live/ToolLiveSimDesign";

/** Center preview canvas — spatial live sim without embedded bottom tray */
export function SpatialStudioCenter({ tool }: { tool: SovereignToolDef }) {
  const mode = tool.slug === "interior-landscape" ? "interior" : "exterior";

  return <ToolLiveSimDesign mode={mode} toolSlug={tool.slug} hideAssetTray />;
}
