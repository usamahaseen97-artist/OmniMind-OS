import type { Scene3D, SceneCollection, Studio3DObject } from "./types";

export class SceneManagerEngine {
  createScene(scenes: Scene3D[], name: string): Scene3D[] {
    const id = `scene-${Date.now()}`;
    return [
      ...scenes.map((s) => ({ ...s, active: false })),
      { id, name, collectionIds: [], active: true },
    ];
  }

  addObject(objects: Studio3DObject[], type: Studio3DObject["type"], name: string): Studio3DObject[] {
    return [
      ...objects,
      {
        id: `obj-${Date.now()}`,
        name,
        type,
        parentId: null,
        collectionId: null,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        visible: true,
        locked: false,
        layer: 0,
        tags: [],
        materialId: null,
      },
    ];
  }

  updateObject(objects: Studio3DObject[], id: string, patch: Partial<Studio3DObject>): Studio3DObject[] {
    return objects.map((o) => (o.id === id ? { ...o, ...patch } : o));
  }

  createCollection(collections: SceneCollection[], sceneId: string, name: string): SceneCollection[] {
    return [...collections, { id: `col-${Date.now()}`, name, sceneId, objectIds: [], visible: true, locked: false }];
  }
}

export const sceneManagerEngine = new SceneManagerEngine();
