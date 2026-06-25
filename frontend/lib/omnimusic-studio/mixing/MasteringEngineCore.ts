import type { MasteringChain, MasteringTarget } from "../mixing-types";
import { DEFAULT_MASTERING, MASTERING_TARGETS } from "./constants";

export class MasteringEngineCore {
  chain: MasteringChain = { ...DEFAULT_MASTERING };

  setTarget(target: MasteringTarget): MasteringChain {
    const t = MASTERING_TARGETS.find((x) => x.id === target);
    this.chain = { ...this.chain, target, targetLufs: t?.lufs ?? -14 };
    return this.chain;
  }

  applyReferenceMatch(refLufs: number): MasteringChain {
    this.chain = { ...this.chain, referenceMatch: true, targetLufs: refLufs };
    return this.chain;
  }
}

export const masteringEngineCore = new MasteringEngineCore();
