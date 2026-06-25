import type { AutomationCurveKind, AutomationCurvePoint, AutomationLane } from "../mixing-types";

export class AutomationCurvesCore {
  lanes: AutomationLane[] = [];

  addLane(targetId: string, param: AutomationLane["param"]): AutomationLane {
    const lane: AutomationLane = { id: `al-${Date.now()}`, targetId, param, points: [] };
    this.lanes.push(lane);
    return lane;
  }

  addPoint(laneId: string, beat: number, value: number, curve: AutomationCurveKind = "linear") {
    const lane = this.lanes.find((l) => l.id === laneId);
    if (!lane) return;
    lane.points.push({ id: `ap-${Date.now()}`, beat, value, curve });
    lane.points.sort((a, b) => a.beat - b.beat);
  }

  serialize(): string {
    return JSON.stringify(this.lanes);
  }
}

export const automationCurvesCore = new AutomationCurvesCore();
