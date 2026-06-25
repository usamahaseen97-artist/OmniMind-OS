import type {
  EditorProject,
  EditorTimelineMarker,
  EditorTimelineRegion,
  TimelineViewState,
} from "./types";

/** Timeline view + marker/region orchestration. */
export class TimelineEngine {
  snapFrame(frame: number, enabled: boolean, fps: number): number {
    if (!enabled) return frame;
    const step = Math.max(1, Math.round(fps / 6));
    return Math.round(frame / step) * step;
  }

  frameToTimecode(frame: number, fps: number): string {
    const totalSec = Math.floor(frame / fps);
    const f = frame % fps;
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    const h = Math.floor(m / 60);
    const mm = m % 60;
    if (h > 0) {
      return `${h}:${String(mm).padStart(2, "0")}:${String(s).padStart(2, "0")}:${String(f).padStart(2, "0")}`;
    }
    return `${String(mm).padStart(2, "0")}:${String(s).padStart(2, "0")}:${String(f).padStart(2, "0")}`;
  }

  addMarker(project: EditorProject, frame: number, label: string): EditorProject {
    const marker: EditorTimelineMarker = {
      id: `marker-${Date.now()}`,
      frame,
      label,
      color: "#67e8f9",
    };
    return { ...project, markers: [...project.markers, marker] };
  }

  addRegion(
    project: EditorProject,
    startFrame: number,
    endFrame: number,
    label: string,
  ): EditorProject {
    const region: EditorTimelineRegion = {
      id: `region-${Date.now()}`,
      startFrame,
      endFrame,
      label,
      color: "#a78bfa40",
    };
    return { ...project, regions: [...project.regions, region] };
  }

  serialize(project: EditorProject): string {
    return JSON.stringify(project);
  }

  deserialize(json: string): EditorProject {
    return JSON.parse(json) as EditorProject;
  }

  computeDuration(tracks: EditorProject["tracks"]): number {
    let max = 0;
    for (const t of tracks) {
      for (const c of t.clips) {
        max = Math.max(max, c.startFrame + c.durationFrames);
      }
    }
    return Math.max(max, 300);
  }

  visibleFrameRange(view: TimelineViewState, viewportWidth: number, fps: number): {
    start: number;
    end: number;
  } {
    const pxPerFrame = 0.8 * (view.zoom / 100);
    const start = Math.floor(view.scrollX / pxPerFrame);
    const end = start + Math.ceil(viewportWidth / pxPerFrame);
    return { start: Math.max(0, start), end };
  }
}

export const timelineEngine = new TimelineEngine();
