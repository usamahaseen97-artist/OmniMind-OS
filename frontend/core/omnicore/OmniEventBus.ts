import type { OmniCoreEventHandler, OmniCoreEventMap, OmniCoreEventName } from "./types";

type HandlerEntry = { handler: OmniCoreEventHandler<OmniCoreEventName>; once: boolean };

/** Cross-tool typed event bus — loose coupling between OmniMind applications. */
export class OmniEventBus {
  private handlers = new Map<string, Set<HandlerEntry>>();
  private backgroundQueue: { event: OmniCoreEventName; payload: OmniCoreEventMap[OmniCoreEventName] }[] = [];

  publish<K extends OmniCoreEventName>(event: K, payload: OmniCoreEventMap[K]) {
    const entries = this.handlers.get(event);
    if (entries) {
      for (const entry of [...entries]) {
        entry.handler(payload as OmniCoreEventMap[OmniCoreEventName]);
        if (entry.once) entries.delete(entry);
      }
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(`omnicore:${event}`, { detail: payload }));
    }
  }

  flushBackground() {
    const queue = [...this.backgroundQueue];
    this.backgroundQueue = [];
    queue.forEach(({ event, payload }) => this.publish(event, payload as never));
  }

  private static readonly MAX_BACKGROUND_QUEUE = 500;

  publishBackground<K extends OmniCoreEventName>(event: K, payload: OmniCoreEventMap[K]) {
    if (this.backgroundQueue.length >= OmniEventBus.MAX_BACKGROUND_QUEUE) {
      this.backgroundQueue.shift();
    }
    this.backgroundQueue.push({ event, payload: payload as OmniCoreEventMap[OmniCoreEventName] });
  }

  subscribe<K extends OmniCoreEventName>(event: K, handler: OmniCoreEventHandler<K>) {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    const entry: HandlerEntry = { handler: handler as OmniCoreEventHandler<OmniCoreEventName>, once: false };
    this.handlers.get(event)!.add(entry);
    return () => this.handlers.get(event)?.delete(entry);
  }

  once<K extends OmniCoreEventName>(event: K, handler: OmniCoreEventHandler<K>) {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    const entry: HandlerEntry = { handler: handler as OmniCoreEventHandler<OmniCoreEventName>, once: true };
    this.handlers.get(event)!.add(entry);
    return () => this.handlers.get(event)?.delete(entry);
  }

  clear(event?: OmniCoreEventName) {
    if (event) this.handlers.delete(event);
    else this.handlers.clear();
  }
}

export const omniEventBus = new OmniEventBus();
