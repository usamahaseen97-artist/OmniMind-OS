import type { OmniRouteId } from "./omni-tools";
import { getOmniTool } from "./omni-tools";

/** Fourteen core developer tools — left sidebar vertical list. */
export const CORE_SIDEBAR_TOOL_IDS: OmniRouteId[] = [
  "omniforge-engine",
  "ai-omnimaps",
  "marketing-ad-king",
  "nasa-science-solver",
  "vfx-editor",
  "vfx-master",
  "architectural-designer",
  "business-analytics",
  "quantum-trading",
  "medical-diagnostic",
  "meta-agent",
];

export function getCoreSidebarTools() {
  return CORE_SIDEBAR_TOOL_IDS.map((id) => {
    const tool = getOmniTool(id);
    return { id, name: tool.name, icon: tool.icon, tagline: tool.tagline };
  });
}
