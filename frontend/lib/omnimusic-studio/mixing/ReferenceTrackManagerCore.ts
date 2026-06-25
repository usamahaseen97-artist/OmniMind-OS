import { REFERENCE_TRACKS } from "./constants";
import type { ReferenceTrack } from "../mixing-types";

export class ReferenceTrackManagerCore {
  list(): ReferenceTrack[] {
    return REFERENCE_TRACKS;
  }
}

export const referenceTrackManagerCore = new ReferenceTrackManagerCore();
