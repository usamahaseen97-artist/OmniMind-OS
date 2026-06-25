export class LatencyManagerEngine {
  measure(context: AudioContext | null): number {
    if (!context) return 0;
    const base = (context.baseLatency ?? 0) * 1000;
    const output = (context.outputLatency ?? 0) * 1000;
    return Math.round(base + output);
  }

  estimateBufferLatency(bufferSize: number, sampleRate: number): number {
    return Math.round((bufferSize / sampleRate) * 1000 * 2);
  }
}

export const latencyManagerEngine = new LatencyManagerEngine();
