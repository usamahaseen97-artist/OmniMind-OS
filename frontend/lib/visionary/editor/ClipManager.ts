import { TrackManager } from "./TrackManager";
import type { EditorClip, EditorTrack } from "./types";

let clipCounter = 0;

export class ClipManager {
  addClip(
    tracks: EditorTrack[],
    trackId: string,
    media: { id: string; name: string; durationFrames: number },
    atFrame: number,
  ): EditorTrack[] {
    clipCounter += 1;
    const track = tracks.find((t) => t.id === trackId);
    if (!track) return tracks;

    const clip: EditorClip = {
      id: `clip-${clipCounter}`,
      trackId,
      mediaId: media.id,
      label: media.name,
      startFrame: atFrame,
      durationFrames: media.durationFrames,
      inPoint: 0,
      outPoint: media.durationFrames,
      color: TrackManager.clipColor(track.type, media.name),
      nestedSequenceId: null,
      effectIds: [],
      transitionInId: null,
      transitionOutId: null,
      opacity: 100,
      volume: 100,
      locked: false,
    };

    return tracks.map((t) =>
      t.id === trackId ? { ...t, clips: [...t.clips, clip] } : t,
    );
  }

  removeClip(tracks: EditorTrack[], clipId: string): EditorTrack[] {
    return tracks.map((t) => ({
      ...t,
      clips: t.clips.filter((c) => c.id !== clipId),
    }));
  }

  splitClip(tracks: EditorTrack[], clipId: string, atFrame: number): EditorTrack[] {
    return tracks.map((t) => {
      const idx = t.clips.findIndex((c) => c.id === clipId);
      if (idx < 0) return t;
      const clip = t.clips[idx]!;
      const rel = atFrame - clip.startFrame;
      if (rel <= 0 || rel >= clip.durationFrames) return t;

      clipCounter += 1;
      const right: EditorClip = {
        ...clip,
        id: `clip-${clipCounter}`,
        startFrame: atFrame,
        durationFrames: clip.durationFrames - rel,
        inPoint: clip.inPoint + rel,
      };
      const left: EditorClip = {
        ...clip,
        durationFrames: rel,
        outPoint: clip.inPoint + rel,
      };
      const clips = [...t.clips];
      clips[idx] = left;
      clips.splice(idx + 1, 0, right);
      return { ...t, clips };
    });
  }

  trimClip(
    tracks: EditorTrack[],
    clipId: string,
    edge: "start" | "end",
    deltaFrames: number,
    ripple: boolean,
  ): EditorTrack[] {
    return tracks.map((t) => {
      const clips = t.clips.map((c) => {
        if (c.id !== clipId) {
          if (ripple && edge === "start" && c.startFrame > (t.clips.find((x) => x.id === clipId)?.startFrame ?? 0)) {
            return { ...c, startFrame: c.startFrame + deltaFrames };
          }
          return c;
        }
        if (edge === "start") {
          const newDur = Math.max(1, c.durationFrames - deltaFrames);
          return {
            ...c,
            startFrame: c.startFrame + deltaFrames,
            durationFrames: newDur,
            inPoint: c.inPoint + deltaFrames,
          };
        }
        return { ...c, durationFrames: Math.max(1, c.durationFrames + deltaFrames) };
      });
      return { ...t, clips };
    });
  }

  joinClips(tracks: EditorTrack[], clipIdA: string, clipIdB: string): EditorTrack[] {
    return tracks.map((t) => {
      const a = t.clips.find((c) => c.id === clipIdA);
      const b = t.clips.find((c) => c.id === clipIdB);
      if (!a || !b || a.trackId !== b.trackId) return t;
      const joined: EditorClip = {
        ...a,
        durationFrames: a.durationFrames + b.durationFrames,
        outPoint: b.outPoint,
        label: `${a.label} + ${b.label}`,
      };
      return {
        ...t,
        clips: t.clips
          .filter((c) => c.id !== clipIdB)
          .map((c) => (c.id === clipIdA ? joined : c)),
      };
    });
  }

  moveClip(tracks: EditorTrack[], clipId: string, newStart: number, magnetic: boolean): EditorTrack[] {
    let snapFrame = newStart;
    if (magnetic) {
      snapFrame = Math.round(newStart / 5) * 5;
    }
    return tracks.map((t) => ({
      ...t,
      clips: t.clips.map((c) =>
        c.id === clipId ? { ...c, startFrame: Math.max(0, snapFrame) } : c,
      ),
    }));
  }

  getClip(tracks: EditorTrack[], clipId: string): EditorClip | undefined {
    for (const t of tracks) {
      const c = t.clips.find((x) => x.id === clipId);
      if (c) return c;
    }
    return undefined;
  }

  applyEffect(tracks: EditorTrack[], clipId: string, effectId: string): EditorTrack[] {
    return tracks.map((t) => ({
      ...t,
      clips: t.clips.map((c) =>
        c.id === clipId && !c.effectIds.includes(effectId)
          ? { ...c, effectIds: [...c.effectIds, effectId] }
          : c,
      ),
    }));
  }
}

export const clipManager = new ClipManager();
