import { EDITOR_TRACK_COLORS } from "./constants";
import type { EditorClip, EditorTrack, EditorTrackType } from "./types";

let trackCounter = 0;

export class TrackManager {
  addTrack(tracks: EditorTrack[], type: EditorTrackType): EditorTrack[] {
    trackCounter += 1;
    const sameType = tracks.filter((t) => t.type === type);
    const track: EditorTrack = {
      id: `track-${type}-${trackCounter}`,
      type,
      label: `${type.charAt(0).toUpperCase()}${type.slice(1)} ${sameType.length + 1}`,
      index: tracks.length,
      muted: false,
      solo: false,
      locked: false,
      visible: true,
      height: type === "audio" ? 48 : 56,
      clips: [],
      nestedSequenceId: null,
    };
    return [...tracks, track];
  }

  removeTrack(tracks: EditorTrack[], trackId: string): EditorTrack[] {
    return tracks
      .filter((t) => t.id !== trackId)
      .map((t, i) => ({ ...t, index: i }));
  }

  reorderTrack(tracks: EditorTrack[], trackId: string, newIndex: number): EditorTrack[] {
    const idx = tracks.findIndex((t) => t.id === trackId);
    if (idx < 0) return tracks;
    const next = [...tracks];
    const [item] = next.splice(idx, 1);
    next.splice(newIndex, 0, item!);
    return next.map((t, i) => ({ ...t, index: i }));
  }

  updateTrack(tracks: EditorTrack[], trackId: string, patch: Partial<EditorTrack>): EditorTrack[] {
    return tracks.map((t) => (t.id === trackId ? { ...t, ...patch } : t));
  }

  toggleMute(tracks: EditorTrack[], trackId: string) {
    return this.updateTrack(tracks, trackId, {
      muted: !tracks.find((t) => t.id === trackId)?.muted,
    });
  }

  toggleSolo(tracks: EditorTrack[], trackId: string) {
    const target = tracks.find((t) => t.id === trackId);
    if (!target) return tracks;
    const solo = !target.solo;
    return tracks.map((t) =>
      t.id === trackId ? { ...t, solo } : solo ? { ...t, solo: false } : t,
    );
  }

  static clipColor(type: EditorTrackType, mediaLabel: string): string {
    return EDITOR_TRACK_COLORS[type] ?? "#94a3b8";
  }
}

export const trackManager = new TrackManager();
