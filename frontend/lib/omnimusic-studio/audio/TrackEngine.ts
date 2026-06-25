import type { DawTrack } from "../types";

export class TrackEngine {
  arm(tracks: DawTrack[], trackId: string, armed: boolean): DawTrack[] {
    return tracks.map((t) => (t.id === trackId ? { ...t, armed } : t));
  }

  armExclusive(tracks: DawTrack[], trackId: string): DawTrack[] {
    return tracks.map((t) => ({ ...t, armed: t.id === trackId }));
  }

  setMonitor(tracks: DawTrack[], trackId: string, monitorInput: boolean): DawTrack[] {
    return tracks.map((t) => (t.id === trackId ? { ...t, monitorInput } : t));
  }

  setRecordEnabled(tracks: DawTrack[], trackId: string, recordEnabled: boolean): DawTrack[] {
    return tracks.map((t) => (t.id === trackId ? { ...t, recordEnabled } : t));
  }

  armedTracks(tracks: DawTrack[]): DawTrack[] {
    return tracks.filter((t) => t.armed && t.recordEnabled && t.kind === "audio");
  }

  monitoringTracks(tracks: DawTrack[]): DawTrack[] {
    return tracks.filter((t) => t.monitorInput && t.kind === "audio");
  }
}

export const trackEngine = new TrackEngine();
