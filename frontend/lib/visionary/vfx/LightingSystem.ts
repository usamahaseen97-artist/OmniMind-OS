import type { Light3D } from "./types";

export class LightingSystemEngine {
  createLight(type: Light3D["type"]): Light3D {
    return {
      id: `light-${Date.now()}`,
      type,
      intensity: 1,
      color: "#ffffff",
      castShadow: type !== "area",
    };
  }
}

export const lightingSystemEngine = new LightingSystemEngine();
