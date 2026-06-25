import type { CompLayer, Composition } from "./types";

let compCounter = 0;
let layerCounter = 0;

export class CompositionManager {
  createComposition(
    compositions: Composition[],
    name: string,
    width = 1920,
    height = 1080,
    fps = 24,
    durationFrames = 240,
    nested = false,
  ): Composition[] {
    compCounter += 1;
    const comp: Composition = {
      id: `comp-${compCounter}`,
      name,
      width,
      height,
      fps,
      durationFrames,
      layers: [],
      nested,
      parentId: null,
    };
    return [...compositions, comp];
  }

  addLayer(compositions: Composition[], compId: string, name: string): Composition[] {
    layerCounter += 1;
    const layer: CompLayer = {
      id: `layer-${layerCounter}`,
      name,
      blendMode: "normal",
      opacity: 100,
      visible: true,
      locked: false,
      maskId: null,
      matteLayerId: null,
      nestedCompId: null,
      adjustment: false,
      renderPass: null,
      effectIds: [],
    };
    return compositions.map((c) =>
      c.id === compId ? { ...c, layers: [...c.layers, layer] } : c,
    );
  }

  updateLayer(
    compositions: Composition[],
    compId: string,
    layerId: string,
    patch: Partial<CompLayer>,
  ): Composition[] {
    return compositions.map((c) =>
      c.id === compId
        ? {
            ...c,
            layers: c.layers.map((l) => (l.id === layerId ? { ...l, ...patch } : l)),
          }
        : c,
    );
  }

  reorderLayer(
    compositions: Composition[],
    compId: string,
    layerId: string,
    newIndex: number,
  ): Composition[] {
    return compositions.map((c) => {
      if (c.id !== compId) return c;
      const layers = [...c.layers];
      const idx = layers.findIndex((l) => l.id === layerId);
      if (idx < 0) return c;
      const [item] = layers.splice(idx, 1);
      layers.splice(newIndex, 0, item!);
      return { ...c, layers };
    });
  }

  getActive(compositions: Composition[], activeId: string): Composition | undefined {
    return compositions.find((c) => c.id === activeId);
  }
}

export const compositionManager = new CompositionManager();
