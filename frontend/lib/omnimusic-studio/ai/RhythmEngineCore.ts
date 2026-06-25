export class RhythmEngineCore {
  pattern(genre: string, bpm: number): { kick: number[]; snare: number[]; hat: number[] } {
    const step = 60 / bpm / 4;
    const len = genre === "Trap" ? 16 : 8;
    return {
      kick: Array.from({ length: len }, (_, i) => (i % 4 === 0 ? i * step : -1)).filter((x) => x >= 0),
      snare: Array.from({ length: len }, (_, i) => (i % 4 === 2 ? i * step : -1)).filter((x) => x >= 0),
      hat: Array.from({ length: len }, (_, i) => i * step),
    };
  }
}

export const rhythmEngineCore = new RhythmEngineCore();
