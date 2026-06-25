import type { EffectStackItem } from "./types";

export class EffectStackManager {
  addEffect(stack: EffectStackItem[], effectId: string, name: string): EffectStackItem[] {
    return [
      ...stack,
      {
        id: `fx-${Date.now()}`,
        effectId,
        name,
        enabled: true,
        params: {},
      },
    ];
  }

  toggle(stack: EffectStackItem[], id: string): EffectStackItem[] {
    return stack.map((e) => (e.id === id ? { ...e, enabled: !e.enabled } : e));
  }

  remove(stack: EffectStackItem[], id: string): EffectStackItem[] {
    return stack.filter((e) => e.id !== id);
  }

  reorder(stack: EffectStackItem[], id: string, direction: "up" | "down"): EffectStackItem[] {
    const idx = stack.findIndex((e) => e.id === id);
    if (idx < 0) return stack;
    const next = [...stack];
    const swap = direction === "up" ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= next.length) return stack;
    [next[idx], next[swap]] = [next[swap]!, next[idx]!];
    return next;
  }
}

export const effectStackManager = new EffectStackManager();
