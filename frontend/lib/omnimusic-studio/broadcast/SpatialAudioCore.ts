import type { SpatialFormat, SpatialMixState, SpatialObject } from "../broadcast-types";
import { DEFAULT_SPATIAL } from "./constants";

export class SpatialAudioCore {
  state: SpatialMixState = { ...DEFAULT_SPATIAL, objects: [...DEFAULT_SPATIAL.objects] };

  setFormat(format: SpatialFormat) {
    this.state.format = format;
    this.state.heightChannels = format === "atmos" ? 2 : format === "7.1" ? 2 : format === "5.1" ? 0 : 0;
    return this.state;
  }

  addObject(label: string): SpatialObject {
    const obj: SpatialObject = {
      id: `obj-${Date.now()}`,
      label,
      x: 0,
      y: 0,
      z: 0,
      width: 1,
      height: 0,
      gain: 1,
    };
    this.state.objects.push(obj);
    return obj;
  }

  updateObject(id: string, patch: Partial<SpatialObject>) {
    const obj = this.state.objects.find((o) => o.id === id);
    if (obj) Object.assign(obj, patch);
    return obj ?? null;
  }

  toggleBinaural(on: boolean) {
    this.state.binauralMonitor = on;
    return this.state;
  }

  toggleRoomSim(on: boolean) {
    this.state.roomSimulation = on;
    return this.state;
  }
}

export const spatialAudioCore = new SpatialAudioCore();
