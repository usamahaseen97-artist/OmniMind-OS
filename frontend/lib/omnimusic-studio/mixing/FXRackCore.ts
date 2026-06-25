import type { FxInsert } from "../mixing-types";
import { FX_PLUGIN_CATALOG } from "./constants";

export class FXRackCore {
  addInsert(inserts: FxInsert[], pluginId: string): FxInsert[] {
    const plugin = FX_PLUGIN_CATALOG.find((p) => p.id === pluginId);
    if (!plugin) return inserts;
    return [...inserts, { id: `ins-${Date.now()}`, pluginId, name: plugin.name, bypassed: false, presetId: null }];
  }

  toggleBypass(inserts: FxInsert[], id: string): FxInsert[] {
    return inserts.map((i) => (i.id === id ? { ...i, bypassed: !i.bypassed } : i));
  }
}

export const fxRackCore = new FXRackCore();

export class PluginHostCore {
  catalog() {
    return FX_PLUGIN_CATALOG;
  }
}

export const pluginHostCore = new PluginHostCore();
