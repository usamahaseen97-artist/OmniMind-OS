import type { MeasurementRecord } from "../../types";

export type Point = { x: number; y: number };

function distance(a: Point, b: Point) {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
}

function angleAtVertex(a: Point, vertex: Point, c: Point) {
  const ab = { x: a.x - vertex.x, y: a.y - vertex.y };
  const cb = { x: c.x - vertex.x, y: c.y - vertex.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const mag = Math.sqrt((ab.x ** 2 + ab.y ** 2) * (cb.x ** 2 + cb.y ** 2));
  return Math.acos(Math.max(-1, Math.min(1, dot / (mag || 1)))) * (180 / Math.PI);
}

function polygonArea(points: Point[]) {
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i]!.x * points[j]!.y;
    area -= points[j]!.x * points[i]!.y;
  }
  return Math.abs(area / 2);
}

/** Measurement tools — distance, area, angle */
export class MeasurementTools {
  measureDistance(studyId: string, seriesId: string, instanceId: string, points: Point[], createdBy: string): MeasurementRecord {
    return {
      id: `meas-${Date.now()}`,
      studyId,
      seriesId,
      instanceId,
      type: "distance",
      value: distance(points[0]!, points[1]!),
      unit: "px",
      points,
      createdBy,
      createdAt: new Date().toISOString(),
    };
  }

  measureArea(studyId: string, seriesId: string, instanceId: string, points: Point[], createdBy: string): MeasurementRecord {
    return {
      id: `meas-${Date.now()}`,
      studyId,
      seriesId,
      instanceId,
      type: "area",
      value: polygonArea(points),
      unit: "px²",
      points,
      createdBy,
      createdAt: new Date().toISOString(),
    };
  }

  measureAngle(studyId: string, seriesId: string, instanceId: string, points: Point[], createdBy: string): MeasurementRecord {
    return {
      id: `meas-${Date.now()}`,
      studyId,
      seriesId,
      instanceId,
      type: "angle",
      value: angleAtVertex(points[0]!, points[1]!, points[2]!),
      unit: "°",
      points,
      createdBy,
      createdAt: new Date().toISOString(),
    };
  }
}

let tools: MeasurementTools | null = null;

export function getMeasurementTools(): MeasurementTools {
  if (!tools) tools = new MeasurementTools();
  return tools;
}
