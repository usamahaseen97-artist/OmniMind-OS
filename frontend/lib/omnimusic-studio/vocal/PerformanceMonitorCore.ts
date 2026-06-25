import type { PerformanceMonitorState } from "../vocal-types";

export class PerformanceMonitorCore {
  sample(latencyMs: number): PerformanceMonitorState {
    const input = Math.random() * 0.6;
    return {
      inputLevel: input,
      peakLevel: Math.min(1, input + Math.random() * 0.2),
      clipping: input > 0.95,
      latencyMs,
      cpuPercent: 15 + Math.random() * 25,
    };
  }
}

export const performanceMonitorCore = new PerformanceMonitorCore();
