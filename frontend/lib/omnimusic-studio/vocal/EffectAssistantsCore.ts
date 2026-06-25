import type { VocalProcessingChain } from "../vocal-types";

export class EQAssistantCore {
  suggest(chain: VocalProcessingChain, energy: number): VocalProcessingChain {
    const presence = energy > 70 ? 3 : 1;
    return { ...chain, eq: { low: -1, mid: 0, high: presence, air: 2 } };
  }
}

export const eqAssistantCore = new EQAssistantCore();

export class CompressorAssistantCore {
  suggest(chain: VocalProcessingChain, dynamicsDb: number): VocalProcessingChain {
    const ratio = dynamicsDb > -10 ? 4 : 2.5;
    return { ...chain, compressor: { threshold: -18, ratio, attack: 10, release: 90 } };
  }
}

export const compressorAssistantCore = new CompressorAssistantCore();

export class ReverbAssistantCore {
  suggest(chain: VocalProcessingChain, category: string): VocalProcessingChain {
    const mix = category === "choir" ? 35 : 12;
    return { ...chain, reverb: { mix, size: 45 } };
  }
}

export const reverbAssistantCore = new ReverbAssistantCore();

export class DelayAssistantCore {
  suggest(chain: VocalProcessingChain, bpm: number): VocalProcessingChain {
    const beatMs = (60 / bpm) * 1000;
    return { ...chain, delay: { mix: 8, timeMs: beatMs / 4, feedback: 20 } };
  }
}

export const delayAssistantCore = new DelayAssistantCore();
