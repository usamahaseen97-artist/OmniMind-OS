import type { LayoutNode, LayoutPreset } from "./types";
import { omniEventBus } from "./OmniEventBus";

const DEFAULT_ROOT: LayoutNode = {
  type: "split",
  id: "root",
  direction: "horizontal",
  ratio: 0.22,
  a: { type: "panel", id: "p-left", panelId: "sidebar" },
  b: {
    type: "split",
    id: "center",
    direction: "vertical",
    ratio: 0.72,
    a: { type: "panel", id: "p-main", panelId: "workspace" },
    b: { type: "panel", id: "p-bottom", panelId: "terminal" },
  },
};

/** Split / resizable layout tree with saved presets. */
export class OmniLayoutManager {
  presets: LayoutPreset[] = [
    { id: "layout-default", name: "Default Three Panel", root: DEFAULT_ROOT, savedAt: new Date().toISOString() },
  ];

  activeLayoutId = "layout-default";

  active() {
    return this.presets.find((p) => p.id === this.activeLayoutId) ?? this.presets[0]!;
  }

  list() {
    return [...this.presets];
  }

  save(name: string, root: LayoutNode = DEFAULT_ROOT) {
    const preset: LayoutPreset = {
      id: `layout-${Date.now()}`,
      name,
      root: structuredClone(root),
      savedAt: new Date().toISOString(),
    };
    this.presets.push(preset);
    omniEventBus.publish("layout:saved", { layoutId: preset.id });
    return preset;
  }

  load(layoutId: string) {
    const preset = this.presets.find((p) => p.id === layoutId);
    if (preset) this.activeLayoutId = layoutId;
    return preset ?? null;
  }

  setSplitRatio(nodeId: string, ratio: number, root: LayoutNode = this.active().root): LayoutNode {
    if (root.type === "split" && root.id === nodeId) return { ...root, ratio };
    if (root.type === "split") {
      return {
        ...root,
        a: this.setSplitRatio(nodeId, ratio, root.a),
        b: this.setSplitRatio(nodeId, ratio, root.b),
      };
    }
    return root;
  }
}

export const omniLayoutManager = new OmniLayoutManager();
