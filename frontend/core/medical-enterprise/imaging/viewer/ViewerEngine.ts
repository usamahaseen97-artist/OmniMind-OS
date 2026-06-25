import type { ViewerState, ViewerTool, ViewerTransform, WindowLevelPreset } from "../types";

export const DEFAULT_TRANSFORM: ViewerTransform = {
  zoom: 1,
  panX: 0,
  panY: 0,
  rotation: 0,
  brightness: 1,
  contrast: 1,
  windowCenter: 40,
  windowWidth: 400,
};

export const WINDOW_LEVEL_PRESETS: WindowLevelPreset[] = [
  { id: "soft-tissue", label: "Soft Tissue", center: 40, width: 400 },
  { id: "lung", label: "Lung", center: -600, width: 1500 },
  { id: "bone", label: "Bone", center: 300, width: 1500 },
  { id: "brain", label: "Brain", center: 40, width: 80 },
];

/** Radiology-style viewer engine — zoom, pan, W/L, tools */
export class ViewerEngine {
  private states = new Map<string, ViewerState>();
  private syncGroups = new Map<string, Set<string>>();

  createState(studyId: string): ViewerState {
    const state: ViewerState = {
      studyId,
      tool: "pan",
      transform: { ...DEFAULT_TRANSFORM },
      fullscreen: false,
    };
    this.states.set(studyId, state);
    return state;
  }

  getState(studyId: string) {
    return this.states.get(studyId) ?? this.createState(studyId);
  }

  setTool(studyId: string, tool: ViewerTool) {
    const s = this.getState(studyId);
    s.tool = tool;
    this.propagateSync(studyId, (id) => this.getState(id).tool = tool);
    return s;
  }

  setTransform(studyId: string, partial: Partial<ViewerTransform>) {
    const s = this.getState(studyId);
    s.transform = { ...s.transform, ...partial };
    this.propagateSync(studyId, (id) => {
      const t = this.getState(id).transform;
      Object.assign(t, partial);
    });
    return s;
  }

  applyWindowLevel(studyId: string, preset: WindowLevelPreset) {
    return this.setTransform(studyId, { windowCenter: preset.center, windowWidth: preset.width });
  }

  zoom(studyId: string, delta: number) {
    const s = this.getState(studyId);
    return this.setTransform(studyId, { zoom: Math.max(0.1, Math.min(20, s.transform.zoom + delta)) });
  }

  pan(studyId: string, dx: number, dy: number) {
    const s = this.getState(studyId);
    return this.setTransform(studyId, { panX: s.transform.panX + dx, panY: s.transform.panY + dy });
  }

  rotate(studyId: string, degrees: number) {
    const s = this.getState(studyId);
    return this.setTransform(studyId, { rotation: (s.transform.rotation + degrees) % 360 });
  }

  setFullscreen(studyId: string, on: boolean) {
    const s = this.getState(studyId);
    s.fullscreen = on;
    return s;
  }

  setComparison(studyId: string, comparisonStudyId: string) {
    const s = this.getState(studyId);
    s.comparisonStudyId = comparisonStudyId;
    return s;
  }

  linkSynchronized(groupId: string, studyIds: string[]) {
    this.syncGroups.set(groupId, new Set(studyIds));
    for (const id of studyIds) {
      const s = this.getState(id);
      s.synchronizedGroupId = groupId;
    }
  }

  private propagateSync(studyId: string, fn: (id: string) => void) {
    const s = this.states.get(studyId);
    if (!s?.synchronizedGroupId) return;
    const group = this.syncGroups.get(s.synchronizedGroupId);
    if (!group) return;
    for (const id of group) {
      if (id !== studyId) fn(id);
    }
  }
}

let engine: ViewerEngine | null = null;

export function getViewerEngine(): ViewerEngine {
  if (!engine) engine = new ViewerEngine();
  return engine;
}
