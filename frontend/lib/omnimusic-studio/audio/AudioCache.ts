import type { WaveformData } from "../audio-types";
import { generatePeaks } from "./time-utils";

export class AudioCacheEngine {
  private cache = new Map<string, WaveformData>();
  private buffers = new Map<string, Float32Array>();

  get(waveformId: string): WaveformData | undefined {
    return this.cache.get(waveformId);
  }

  getBuffer(waveformId: string): Float32Array | undefined {
    return this.buffers.get(waveformId);
  }

  set(data: WaveformData, buffer?: Float32Array): void {
    this.cache.set(data.id, data);
    if (buffer) this.buffers.set(data.id, buffer);
  }

  delete(waveformId: string): void {
    this.cache.delete(waveformId);
    this.buffers.delete(waveformId);
  }

  all(): Record<string, WaveformData> {
    return Object.fromEntries(this.cache);
  }

  seed(clipId: string, waveformId: string, durationSec: number, sampleRate: number): WaveformData {
    const existing = this.cache.get(waveformId);
    if (existing) return existing;
    const peaks = generatePeaks(128, clipId.length);
    const data: WaveformData = {
      id: waveformId,
      clipId,
      peaks,
      sampleRate,
      durationSec,
      channels: 2,
      normalized: false,
    };
    this.cache.set(waveformId, data);
    return data;
  }

  updatePeaks(waveformId: string, peaks: number[], normalized = false): void {
    const existing = this.cache.get(waveformId);
    if (!existing) return;
    this.cache.set(waveformId, { ...existing, peaks, normalized });
  }
}

export const audioCacheEngine = new AudioCacheEngine();
