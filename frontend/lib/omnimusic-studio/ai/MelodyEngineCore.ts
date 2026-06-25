import type { MelodySketch } from "../ai-types";

export class MelodyEngineCore {
  sketch(key: string, scale: string, bars = 8): MelodySketch {
    const base = 60 + "CDEFGAB".indexOf(key.charAt(0));
    const notes = Array.from({ length: bars }, (_, i) => ({
      pitch: base + (i % 5) * 2,
      startBeat: i,
      durationBeats: 0.75,
    }));
    return { id: `mel-${Date.now()}`, name: `${key} ${scale} melody`, key, scale, notes };
  }
}

export const melodyEngineCore = new MelodyEngineCore();
