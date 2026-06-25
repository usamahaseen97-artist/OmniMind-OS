import type { ChordProgression } from "../ai-types";

const SEED: ChordProgression[] = [
  { id: "ch-1", name: "Pop I-V-vi-IV", key: "C", chords: ["C", "G", "Am", "F"], bars: 8 },
  { id: "ch-2", name: "Jazz ii-V-I", key: "D", chords: ["Dm7", "G7", "Cmaj7"], bars: 4 },
  { id: "ch-3", name: "Trap minor", key: "A", chords: ["Am", "F", "C", "G"], bars: 8 },
];

export class ChordEngineCore {
  list(): ChordProgression[] {
    return SEED;
  }

  generate(key: string, mood: string): ChordProgression {
    const pool = mood === "Dark" ? ["Am", "Dm", "Em", "F"] : ["C", "F", "G", "Am"];
    return {
      id: `ch-${Date.now()}`,
      name: `${mood} in ${key}`,
      key,
      chords: pool,
      bars: 8,
    };
  }
}

export const chordEngineCore = new ChordEngineCore();
