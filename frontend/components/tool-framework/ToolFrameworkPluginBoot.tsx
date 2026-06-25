"use client";

import { useToolFrameworkPlugins } from "../../lib/universal-tool-framework-context";

/** Registers core tool plugins once at app boot. */
export function ToolFrameworkPluginBoot() {
  useToolFrameworkPlugins();
  return null;
}
