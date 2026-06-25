import type { VocalProcessingChain } from "../vocal-types";

export class VocalHarmonyEngineCore {
  generate(chain: VocalProcessingChain, intervals: number[]): VocalProcessingChain {
    return { ...chain, harmony: { enabled: true, intervals } };
  }
}

export const vocalHarmonyEngineCore = new VocalHarmonyEngineCore();

export class DoubleTrackingCore {
  enable(chain: VocalProcessingChain): VocalProcessingChain {
    return {
      ...chain,
      doubleTracking: { enabled: true, delayMs: 22, detuneCents: 10, width: 75 },
    };
  }
}

export const doubleTrackingCore = new DoubleTrackingCore();

export class ChoirGeneratorCore {
  layers(): string[] {
    return ["Soprano", "Alto", "Tenor", "Bass"];
  }
}

export const choirGeneratorCore = new ChoirGeneratorCore();

export class BackingVocalsCore {
  suggestHarmonies(key: string): number[] {
    return [3, 5, 7];
  }
}

export const backingVocalsCore = new BackingVocalsCore();
