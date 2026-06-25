import type { OmniToolSlug } from "./types";

type StateSlice = Record<string, unknown>;

/** Central reactive state store for platform-level data. */
export class OmniStateManager {
  private global: StateSlice = {};
  private perTool = new Map<OmniToolSlug, StateSlice>();
  private listeners = new Set<() => void>();

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    this.listeners.forEach((l) => l());
  }

  getGlobal<T>(key: string, fallback: T): T {
    return (this.global[key] as T | undefined) ?? fallback;
  }

  setGlobal(key: string, value: unknown) {
    this.global[key] = value;
    this.emit();
  }

  getTool<T>(toolSlug: OmniToolSlug, key: string, fallback: T): T {
    const slice = this.perTool.get(toolSlug) ?? {};
    return (slice[key] as T | undefined) ?? fallback;
  }

  setTool(toolSlug: OmniToolSlug, key: string, value: unknown) {
    const slice = { ...(this.perTool.get(toolSlug) ?? {}), [key]: value };
    this.perTool.set(toolSlug, slice);
    this.emit();
  }

  snapshot() {
    return {
      global: { ...this.global },
      tools: Object.fromEntries([...this.perTool.entries()].map(([k, v]) => [k, { ...v }])),
    };
  }

  restore(snapshot: { global: StateSlice; tools: Record<string, StateSlice> }) {
    this.global = { ...snapshot.global };
    this.perTool = new Map(Object.entries(snapshot.tools));
    this.emit();
  }
}

export const omniStateManager = new OmniStateManager();
