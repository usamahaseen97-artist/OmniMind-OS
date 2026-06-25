import type { ChordProgression } from "../ai-types";

export class HarmonyEngineCore {
  voiceLead(progression: ChordProgression): string[] {
    return progression.chords.map((c, i) => `${c} voicing ${i + 1}`);
  }
}

export const harmonyEngineCore = new HarmonyEngineCore();
