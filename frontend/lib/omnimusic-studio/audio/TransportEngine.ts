import type { ExtendedTransportState } from "../audio-types";
import { beatsToSeconds } from "./time-utils";

export function createDefaultTransport(sampleRate = 48000): ExtendedTransportState {
  return {
    status: "stopped",
    playing: false,
    paused: false,
    recording: false,
    loopEnabled: true,
    loopStart: 0,
    loopEnd: 16,
    tempo: 120,
    timeSignature: [4, 4],
    playheadBeat: 0,
    playbackSpeed: 1,
    displayMode: "bars",
    locatorLeft: null,
    locatorRight: null,
    cycleRegion: null,
    sampleRate,
  };
}

export class TransportEngine {
  play(t: ExtendedTransportState): ExtendedTransportState {
    return { ...t, status: "playing", playing: true, paused: false, recording: false };
  }

  pause(t: ExtendedTransportState): ExtendedTransportState {
    return { ...t, status: "paused", playing: false, paused: true };
  }

  stop(t: ExtendedTransportState): ExtendedTransportState {
    return { ...t, status: "stopped", playing: false, paused: false, recording: false, playheadBeat: t.locatorLeft ?? 0 };
  }

  record(t: ExtendedTransportState): ExtendedTransportState {
    return { ...t, status: "recording", recording: true, playing: true, paused: false };
  }

  seek(t: ExtendedTransportState, beat: number): ExtendedTransportState {
    const clamped = Math.max(0, beat);
    if (t.cycleRegion) {
      const { startBeat, endBeat } = t.cycleRegion;
      if (clamped < startBeat) return { ...t, playheadBeat: startBeat };
      if (clamped > endBeat) return { ...t, playheadBeat: endBeat };
    }
    return { ...t, playheadBeat: clamped };
  }

  advance(t: ExtendedTransportState, deltaBeats: number): ExtendedTransportState {
    let next = t.playheadBeat + deltaBeats * t.playbackSpeed;
    if (t.loopEnabled && next >= t.loopEnd) next = t.loopStart + (next - t.loopEnd);
    if (t.cycleRegion && next > t.cycleRegion.endBeat) next = t.cycleRegion.startBeat;
    return { ...t, playheadBeat: next };
  }

  rewind(t: ExtendedTransportState, beats = 1): ExtendedTransportState {
    return this.seek(t, t.playheadBeat - beats);
  }

  fastForward(t: ExtendedTransportState, beats = 1): ExtendedTransportState {
    return this.seek(t, t.playheadBeat + beats);
  }

  frameStep(t: ExtendedTransportState, direction: 1 | -1): ExtendedTransportState {
    const sec = beatsToSeconds(1 / 30, t.tempo) * direction;
    const beatDelta = (sec * t.tempo) / 60;
    return this.seek(t, t.playheadBeat + beatDelta);
  }

  setCycle(t: ExtendedTransportState, start: number, end: number): ExtendedTransportState {
    return { ...t, cycleRegion: { startBeat: start, endBeat: end }, loopStart: start, loopEnd: end, loopEnabled: true };
  }

  clearCycle(t: ExtendedTransportState): ExtendedTransportState {
    return { ...t, cycleRegion: null };
  }
}

export const transportEngine = new TransportEngine();
