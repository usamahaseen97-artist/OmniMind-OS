import type { MixPreset } from "../mixing-types";
import { MIX_PRESETS } from "./constants";

export class MixPresetManagerCore {
  private custom: MixPreset[] = [];

  all(): MixPreset[] {
    return [...MIX_PRESETS, ...this.custom];
  }

  save(preset: MixPreset) {
    this.custom.unshift(preset);
  }
}

export const mixPresetManagerCore = new MixPresetManagerCore();
