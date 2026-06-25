import type { BlendMode, CompLayer, Composition } from "./types";

/** Compositing engine — layer stack evaluation (architecture stub). */
export class CompositorEngine {
  evaluateStack(layers: CompLayer[]): { visibleCount: number; passes: string[] } {
    const visible = layers.filter((l) => l.visible);
    const passes = [...new Set(visible.map((l) => l.renderPass).filter(Boolean))] as string[];
    return { visibleCount: visible.length, passes };
  }

  applyBlend(bottom: CompLayer, top: CompLayer, mode: BlendMode): number {
    const op = (bottom.opacity / 100) * (top.opacity / 100);
    if (mode === "add") return Math.min(1, op * 1.2);
    if (mode === "multiply") return op * 0.8;
    return op;
  }

  renderPass(comp: Composition, passName: string | null): { frame: string; layers: number } {
    const layers = comp.layers.filter(
      (l) => l.visible && (passName ? l.renderPass === passName : !l.renderPass),
    );
    return { frame: "preview-stub", layers: layers.length };
  }
}

export const compositorEngine = new CompositorEngine();
