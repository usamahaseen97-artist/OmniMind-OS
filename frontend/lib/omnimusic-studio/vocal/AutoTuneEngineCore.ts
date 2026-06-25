import type { VocalProcessingChain } from "../vocal-types";

export class AutoTuneEngineCore {
  apply(chain: VocalProcessingChain, targetKey = "C"): VocalProcessingChain {
    return {
      ...chain,
      autoTune: { ...chain.autoTune, enabled: true },
      pitchCorrection: true,
    };
  }

  setFormant(chain: VocalProcessingChain, formant: number): VocalProcessingChain {
    return { ...chain, autoTune: { ...chain.autoTune, formant } };
  }

  setVibrato(chain: VocalProcessingChain, vibrato: number): VocalProcessingChain {
    return { ...chain, autoTune: { ...chain.autoTune, vibrato } };
  }
}

export const autoTuneEngineCore = new AutoTuneEngineCore();
