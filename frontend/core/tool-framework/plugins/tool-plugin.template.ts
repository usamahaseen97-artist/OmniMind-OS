import type { ToolPluginManifest } from "../types";

/**
 * Template for future OmniMind tools — copy and customize business logic only.
 *
 * ```ts
 * import { installToolPlugin } from "@/core/tool-framework";
 * import { myToolPlugin } from "./my-tool.plugin";
 * installToolPlugin(myToolPlugin);
 * ```
 */
export const TOOL_PLUGIN_TEMPLATE: ToolPluginManifest = {
  id: "my-tool-plugin",
  name: "My Tool",
  version: "0.1.0",
  description: "Replace with your tool description.",
  register: (api) => {
    // api.registerTool({ toolId, title, description, icon, ... });
    void api;
  },
};
