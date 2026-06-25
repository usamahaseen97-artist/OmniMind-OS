/** Beat, sample, and frame conversions for transport display. */

const FRAMES_PER_SECOND = 30;

export function beatsToSeconds(beat: number, tempo: number): number {
  return (beat * 60) / tempo;
}

export function secondsToBeats(sec: number, tempo: number): number {
  return (sec * tempo) / 60;
}

export function beatsToSamples(beat: number, tempo: number, sampleRate: number): number {
  return Math.round(beatsToSeconds(beat, tempo) * sampleRate);
}

export function samplesToBeats(samples: number, tempo: number, sampleRate: number): number {
  return secondsToBeats(samples / sampleRate, tempo);
}

export function beatsToFrames(beat: number, tempo: number): number {
  return Math.round(beatsToSeconds(beat, tempo) * FRAMES_PER_SECOND);
}

export function formatTransportTime(
  beat: number,
  tempo: number,
  timeSignature: [number, number],
  sampleRate: number,
  mode: "bars" | "beats" | "samples" | "frames",
): string {
  const [num, den] = timeSignature;
  const beatsPerBar = num * (4 / den);
  const bar = Math.floor(beat / beatsPerBar) + 1;
  const beatInBar = Math.floor(beat % beatsPerBar) + 1;
  const tick = Math.floor((beat % 1) * 100);

  switch (mode) {
    case "bars":
      return `${bar}.${beatInBar}.${tick.toString().padStart(2, "0")}`;
    case "beats":
      return `${beat.toFixed(2)} beats`;
    case "samples":
      return `${beatsToSamples(beat, tempo, sampleRate)} smp`;
    case "frames":
      return `${beatsToFrames(beat, tempo)} fr`;
    default:
      return `${bar}.${beatInBar}.${tick}`;
  }
}

export function generatePeaks(length: number, seed = 0): number[] {
  const peaks: number[] = [];
  for (let i = 0; i < length; i++) {
    const t = (i + seed) / length;
    peaks.push(Math.abs(Math.sin(t * Math.PI * 8 + seed) * (0.3 + 0.7 * Math.random())));
  }
  return peaks;
}

export function extractPeaks(buffer: Float32Array, buckets: number): number[] {
  const block = Math.max(1, Math.floor(buffer.length / buckets));
  const peaks: number[] = [];
  for (let i = 0; i < buckets; i++) {
    let max = 0;
    const start = i * block;
    const end = Math.min(buffer.length, start + block);
    for (let j = start; j < end; j++) {
      max = Math.max(max, Math.abs(buffer[j] ?? 0));
    }
    peaks.push(max);
  }
  return peaks;
}
