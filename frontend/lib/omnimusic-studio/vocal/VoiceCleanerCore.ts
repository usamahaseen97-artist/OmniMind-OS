import type { VocalProcessingChain } from "../vocal-types";

export class VoiceCleanerCore {
  clean(chain: VocalProcessingChain, amount: number): VocalProcessingChain {
    return { ...chain, noiseCleanup: { enabled: true, amount } };
  }
}

export const voiceCleanerCore = new VoiceCleanerCore();

export class NoiseReducerCore {
  reduce(chain: VocalProcessingChain, amount: number) {
    return voiceCleanerCore.clean(chain, amount);
  }
}

export const noiseReducerCore = new NoiseReducerCore();

export class BreathRemovalCore {
  apply(chain: VocalProcessingChain, amount: number): VocalProcessingChain {
    return { ...chain, breathReduction: { enabled: true, amount } };
  }
}

export const breathRemovalCore = new BreathRemovalCore();

export class DeEsserCore {
  apply(chain: VocalProcessingChain, threshold: number, frequency: number): VocalProcessingChain {
    return { ...chain, deEsser: { enabled: true, threshold, frequency } };
  }
}

export const deEsserCore = new DeEsserCore();
