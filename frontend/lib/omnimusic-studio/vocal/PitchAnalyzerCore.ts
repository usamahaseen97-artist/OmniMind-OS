import type { PitchAnalysis } from "../vocal-types";

export class PitchAnalyzerCore {
  detectPitch(samples: number[] = []): PitchAnalysis {
    const base = samples.length ? 200 : 261.63;
    return {
      averageHz: base,
      minHz: base * 0.9,
      maxHz: base * 1.4,
      centsOff: 0,
      confidence: 0.85,
    };
  }
}

export const pitchAnalyzerCore = new PitchAnalyzerCore();
