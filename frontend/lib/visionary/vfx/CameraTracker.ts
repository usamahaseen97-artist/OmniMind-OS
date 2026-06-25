import type { TrackingMode, TrackingPoint, TrackingSession } from "./types";

export class CameraTrackerEngine {
  startSession(mode: TrackingMode, label: string): TrackingSession {
    return {
      id: `track-${Date.now()}`,
      mode,
      label,
      points: [],
      status: "idle",
    };
  }

  addPoint(session: TrackingSession, frame: number, x: number, y: number): TrackingSession {
    const point: TrackingPoint = {
      id: `tp-${Date.now()}`,
      frame,
      x,
      y,
      confidence: 0.95,
    };
    return { ...session, points: [...session.points, point] };
  }

  solve(session: TrackingSession): TrackingSession {
    return { ...session, status: "solved" };
  }
}

export const cameraTrackerEngine = new CameraTrackerEngine();
export const motionTrackerEngine = cameraTrackerEngine;
