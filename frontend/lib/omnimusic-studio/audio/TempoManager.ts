export class TempoManagerEngine {
  clampTempo(tempo: number): number {
    return Math.min(999, Math.max(20, tempo));
  }

  setTempo(current: number, tempo: number): number {
    return this.clampTempo(tempo);
  }

  setTimeSignature(sig: [number, number]): [number, number] {
    const [num, den] = sig;
    const validDen = [1, 2, 4, 8, 16].includes(den) ? den : 4;
    return [Math.min(32, Math.max(1, num)), validDen as 1 | 2 | 4 | 8 | 16];
  }
}

export const tempoManagerEngine = new TempoManagerEngine();
