import type { SmartRecordingState, VocalRecordingMode, VocalTake } from "../vocal-types";
import { vocalTakeManagerEngine } from "./VocalTakeManagerEngine";

export class SmartRecordingEngine {
  state: SmartRecordingState = {
    mode: "live",
    loopEnabled: false,
    punchIn: null,
    punchOut: null,
    activeTakeId: null,
    sessionNotes: "",
    trackComments: {},
    markers: [],
  };

  setMode(mode: VocalRecordingMode) {
    this.state = { ...this.state, mode };
  }

  addMarker(beat: number, label: string, note = "") {
    this.state.markers.push({ id: `vm-${Date.now()}`, beat, label, note });
  }

  recordTake(trackId: string, startBeat: number, durationBeats: number): VocalTake {
    const takes = vocalTakeManagerEngine.list(trackId);
    const take = vocalTakeManagerEngine.add({
      trackId,
      name: `Take ${takes.length + 1}`,
      takeNumber: takes.length + 1,
      startBeat,
      durationBeats,
      waveformId: null,
      comped: false,
      starred: false,
      notes: "",
    });
    this.state.activeTakeId = take.id;
    return take;
  }
}

export const smartRecordingEngine = new SmartRecordingEngine();
