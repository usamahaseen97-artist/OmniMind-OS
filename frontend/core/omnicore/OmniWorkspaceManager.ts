import type { OmniToolSlug, WorkspacePreset } from "./types";
import { DEFAULT_LAYOUT_PRESETS } from "./constants";
import { omniEventBus } from "./OmniEventBus";

/** Workspace presets and active workspace per tool. */
export class OmniWorkspaceManager {
  presets: WorkspacePreset[] = DEFAULT_LAYOUT_PRESETS.map((p) => ({
    id: p.id,
    name: p.name,
    toolSlug: "*",
    layoutId: p.id,
    dockState: { slots: [], activePanelId: null },
  }));

  activePresetId = "layout-default";
  activeToolSlug: OmniToolSlug | null = null;

  list(toolSlug?: OmniToolSlug) {
    if (!toolSlug) return this.presets;
    return this.presets.filter((p) => p.toolSlug === "*" || p.toolSlug === toolSlug);
  }

  active() {
    return this.presets.find((p) => p.id === this.activePresetId) ?? this.presets[0] ?? null;
  }

  switchPreset(presetId: string) {
    const preset = this.presets.find((p) => p.id === presetId);
    if (!preset) return null;
    this.activePresetId = presetId;
    omniEventBus.publish("workspace:changed", { presetId });
    return preset;
  }

  savePreset(name: string, toolSlug: OmniToolSlug | "*", layoutId: string): WorkspacePreset {
    const preset: WorkspacePreset = {
      id: `ws-${Date.now()}`,
      name,
      toolSlug,
      layoutId,
      dockState: { slots: [], activePanelId: null },
    };
    this.presets.push(preset);
    return preset;
  }

  setActiveTool(toolSlug: OmniToolSlug) {
    this.activeToolSlug = toolSlug;
  }
}

export const omniWorkspaceManager = new OmniWorkspaceManager();
