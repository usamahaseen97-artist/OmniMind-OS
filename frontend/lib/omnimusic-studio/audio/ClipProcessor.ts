import type { WaveformData } from "../audio-types";
import { audioCacheEngine } from "./AudioCache";

export class ClipProcessorEngine {
  normalize(waveformId: string): WaveformData | null {
    const data = audioCacheEngine.get(waveformId);
    const buffer = audioCacheEngine.getBuffer(waveformId);
    if (!data || !buffer) return this.normalizePeaksOnly(waveformId);
    const max = Math.max(...buffer.map(Math.abs), 0.001);
    const scaled = new Float32Array(buffer.length);
    for (let i = 0; i < buffer.length; i++) scaled[i] = (buffer[i] ?? 0) / max;
    audioCacheEngine.set({ ...data, normalized: true }, scaled);
    return audioCacheEngine.get(waveformId) ?? null;
  }

  private normalizePeaksOnly(waveformId: string): WaveformData | null {
    const data = audioCacheEngine.get(waveformId);
    if (!data) return null;
    const max = Math.max(...data.peaks, 0.001);
    const peaks = data.peaks.map((p) => p / max);
    audioCacheEngine.updatePeaks(waveformId, peaks, true);
    return audioCacheEngine.get(waveformId) ?? null;
  }

  reverse(waveformId: string): WaveformData | null {
    const data = audioCacheEngine.get(waveformId);
    const buffer = audioCacheEngine.getBuffer(waveformId);
    if (!data) return null;
    if (buffer) {
      const reversed = new Float32Array(buffer.length);
      for (let i = 0; i < buffer.length; i++) reversed[i] = buffer[buffer.length - 1 - i] ?? 0;
      const peaks = [...data.peaks].reverse();
      audioCacheEngine.set({ ...data, peaks }, reversed);
    } else {
      audioCacheEngine.updatePeaks(waveformId, [...data.peaks].reverse(), data.normalized);
    }
    return audioCacheEngine.get(waveformId) ?? null;
  }

  fadeIn(waveformId: string, ratio = 0.1): WaveformData | null {
    return this.applyEnvelope(waveformId, (t) => Math.min(1, t / ratio));
  }

  fadeOut(waveformId: string, ratio = 0.1): WaveformData | null {
    return this.applyEnvelope(waveformId, (t) => Math.min(1, (1 - t) / ratio));
  }

  silence(waveformId: string): WaveformData | null {
    const data = audioCacheEngine.get(waveformId);
    if (!data) return null;
    const peaks = data.peaks.map(() => 0);
    audioCacheEngine.updatePeaks(waveformId, peaks, data.normalized);
    const buffer = audioCacheEngine.getBuffer(waveformId);
    if (buffer) audioCacheEngine.set(data, new Float32Array(buffer.length));
    return audioCacheEngine.get(waveformId) ?? null;
  }

  private applyEnvelope(waveformId: string, fn: (t: number) => number): WaveformData | null {
    const data = audioCacheEngine.get(waveformId);
    const buffer = audioCacheEngine.getBuffer(waveformId);
    if (!data) return null;
    const peaks = data.peaks.map((p, i) => p * fn(i / data.peaks.length));
    audioCacheEngine.updatePeaks(waveformId, peaks, data.normalized);
    if (buffer) {
      const out = new Float32Array(buffer.length);
      for (let i = 0; i < buffer.length; i++) out[i] = (buffer[i] ?? 0) * fn(i / buffer.length);
      audioCacheEngine.set(data, out);
    }
    return audioCacheEngine.get(waveformId) ?? null;
  }

  duplicatePeaks(waveformId: string): WaveformData | null {
    const data = audioCacheEngine.get(waveformId);
    if (!data) return null;
    const newId = `${waveformId}-dup-${Date.now()}`;
    const dup: WaveformData = { ...data, id: newId, clipId: `${data.clipId}-dup` };
    audioCacheEngine.set(dup, audioCacheEngine.getBuffer(waveformId)?.slice());
    return dup;
  }
}

export const clipProcessorEngine = new ClipProcessorEngine();
