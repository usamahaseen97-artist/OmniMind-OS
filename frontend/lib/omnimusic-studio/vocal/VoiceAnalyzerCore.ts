import type { PitchAnalysis, VoiceAnalysisReport } from "../vocal-types";

export class VoiceAnalyzerCore {
  analyze(takeId: string): VoiceAnalysisReport {
    const pitch: PitchAnalysis = {
      averageHz: 220 + Math.random() * 80,
      minHz: 180,
      maxHz: 420,
      centsOff: Math.random() * 20 - 10,
      confidence: 0.75 + Math.random() * 0.2,
    };
    return {
      id: `var-${Date.now()}`,
      takeId,
      pitch,
      timingMs: Math.round(Math.random() * 30),
      dynamicsDb: -12 + Math.random() * 6,
      breathingEvents: Math.floor(Math.random() * 8),
      pronunciationScore: 70 + Math.random() * 25,
      energy: 50 + Math.random() * 40,
      rangeSemitones: 12 + Math.random() * 8,
      confidence: pitch.confidence,
      analyzedAt: new Date().toISOString(),
    };
  }
}

export const voiceAnalyzerCore = new VoiceAnalyzerCore();
