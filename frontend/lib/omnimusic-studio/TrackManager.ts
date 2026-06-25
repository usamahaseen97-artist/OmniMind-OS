import type { DawTrack, TimelineClip, TrackKind } from "./types";
import { TRACK_COLORS } from "./constants";

export class TrackManagerEngine {
  add(tracks: DawTrack[], kind: TrackKind, name: string): DawTrack[] {
    if (kind === "master" && tracks.some((t) => t.kind === "master")) return tracks;
    return [
      ...tracks,
      {
        id: `tr-${Date.now()}`,
        name,
        kind,
        color: TRACK_COLORS[kind],
        muted: false,
        solo: false,
        armed: false,
        monitorInput: false,
        recordEnabled: kind === "audio",
        volume: 0.8,
        pan: 0,
        parentId: null,
        fxSlotIds: [],
        sendLevels: {},
      },
    ];
  }

  update(tracks: DawTrack[], id: string, patch: Partial<DawTrack>): DawTrack[] {
    return tracks.map((t) => (t.id === id ? { ...t, ...patch } : t));
  }

  addClip(clips: TimelineClip[], trackId: string, name: string, start: number, dur: number): TimelineClip[] {
    return [
      ...clips,
      { id: `clip-${Date.now()}`, trackId, name, startBeat: start, durationBeats: dur, color: "#818cf8", loop: false },
    ];
  }
}

export const trackManagerEngine = new TrackManagerEngine();
