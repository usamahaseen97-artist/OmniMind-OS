import type { VocalTake } from "../vocal-types";
import { vocalTakeManagerEngine } from "./VocalTakeManagerEngine";

export class CompEditorCore {
  buildComp(trackId: string): VocalTake[] {
    return vocalTakeManagerEngine.list(trackId).filter((t) => t.starred || t.comped);
  }

  selectBest(trackId: string): VocalTake | null {
    const takes = vocalTakeManagerEngine.list(trackId);
    return takes.find((t) => t.comped) ?? takes.find((t) => t.starred) ?? takes[0] ?? null;
  }
}

export const compEditorCore = new CompEditorCore();
