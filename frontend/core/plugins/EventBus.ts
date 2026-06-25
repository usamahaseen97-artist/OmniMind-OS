import type { PluginEventHandler, PluginEventMap, PluginEventName } from "./types";

type HandlerEntry = { handler: PluginEventHandler; once: boolean };

/** Global event bus — plugins publish and subscribe without tight coupling. */
export class EventBus {
  private handlers = new Map<string, Set<HandlerEntry>>();

  publish<K extends PluginEventName>(event: K, payload: PluginEventMap[K]) {
    const entries = this.handlers.get(event);
    if (entries) {
      for (const entry of [...entries]) {
        entry.handler(payload);
        if (entry.once) entries.delete(entry);
      }
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(`omnimind:plugin:${event}`, { detail: payload }));
    }
  }

  subscribe<K extends PluginEventName>(event: K, handler: PluginEventHandler<K>) {
    const key = event as string;
    if (!this.handlers.has(key)) this.handlers.set(key, new Set());
    const entry: HandlerEntry = { handler: handler as PluginEventHandler, once: false };
    this.handlers.get(key)!.add(entry);
    return () => this.handlers.get(key)?.delete(entry);
  }

  once<K extends PluginEventName>(event: K, handler: PluginEventHandler<K>) {
    const key = event as string;
    if (!this.handlers.has(key)) this.handlers.set(key, new Set());
    const entry: HandlerEntry = { handler: handler as PluginEventHandler, once: true };
    this.handlers.get(key)!.add(entry);
    return () => this.handlers.get(key)?.delete(entry);
  }

  clear(event?: PluginEventName) {
    if (event) this.handlers.delete(event);
    else this.handlers.clear();
  }
}

let bus: EventBus | null = null;

export function getPluginEventBus(): EventBus {
  if (!bus) bus = new EventBus();
  return bus;
}
