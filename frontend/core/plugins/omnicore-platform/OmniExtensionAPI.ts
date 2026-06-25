import type { ExtensionCommand, ExtensionPanel, PluginHook, ToolRegistration } from "./types";

/** Developer extension API — tools, commands, panels, hooks. */
export class OmniExtensionAPI {
  commands: ExtensionCommand[] = [];
  panels: ExtensionPanel[] = [];
  tools: ToolRegistration[] = [];
  hooks = new Map<PluginHook, string[]>();

  registerCommand(cmd: ExtensionCommand) {
    this.commands.push(cmd);
    return cmd;
  }

  registerPanel(panel: ExtensionPanel) {
    this.panels.push(panel);
    return panel;
  }

  registerTool(reg: ToolRegistration) {
    this.tools.push(reg);
    return reg;
  }

  on(hook: PluginHook, pluginId: string) {
    const list = this.hooks.get(hook) ?? [];
    list.push(pluginId);
    this.hooks.set(hook, list);
    return () => this.hooks.set(hook, list.filter((id) => id !== pluginId));
  }

  hookPlugins(hook: PluginHook) {
    return this.hooks.get(hook) ?? [];
  }
}

export const omniExtensionAPI = new OmniExtensionAPI();
