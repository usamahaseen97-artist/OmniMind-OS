import { getPluginEventBus } from "../../../core/plugins/EventBus";
import type { PluginEventMap } from "../../../core/plugins/types";
import type { SDKEventHandler, SDKEventMap, SDKEventName } from "../../shared/events/types";

type HandlerEntry = { handler: SDKEventHandler; once: boolean };

/**
 * OmniMind SDK Event Bus — bridges plugin events + SDK OS events.
 * Modules subscribe without tight coupling.
 */
export class SDKEventBus {
  private handlers = new Map<string, Set<HandlerEntry>>();
  private pluginBridge: (() => void)[] = [];

  constructor() {
    if (typeof window !== "undefined") {
      const bridge = (e: Event) => {
        const detail = (e as CustomEvent).detail;
        const name = (e as CustomEvent).type.replace("omnimind:sdk:", "") as SDKEventName;
        this.emitLocal(name, detail);
      };
      window.addEventListener("omnimind:sdk:bridge", bridge as EventListener);
      this.pluginBridge.push(() => window.removeEventListener("omnimind:sdk:bridge", bridge as EventListener));
    }
  }

  private emitLocal<K extends SDKEventName>(event: K, payload: SDKEventMap[K]) {
    const entries = this.handlers.get(event);
    if (entries) {
      for (const entry of [...entries]) {
        entry.handler(payload);
        if (entry.once) entries.delete(entry);
      }
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(`omnimind:sdk:${event}`, { detail: payload }));
    }
  }

  publish<K extends SDKEventName>(event: K, payload: SDKEventMap[K]) {
    this.emitLocal(event, payload);
  }

  subscribe<K extends SDKEventName>(event: K, handler: SDKEventHandler<K>) {
    const key = event as string;
    if (!this.handlers.has(key)) this.handlers.set(key, new Set());
    const entry = { handler: handler as SDKEventHandler, once: false };
    this.handlers.get(key)!.add(entry);
    return () => this.handlers.get(key)?.delete(entry);
  }

  once<K extends SDKEventName>(event: K, handler: SDKEventHandler<K>) {
    const key = event as string;
    if (!this.handlers.has(key)) this.handlers.set(key, new Set());
    const entry = { handler: handler as SDKEventHandler, once: true };
    this.handlers.get(key)!.add(entry);
    return () => this.handlers.get(key)?.delete(entry);
  }

  /** Bridge plugin event bus into SDK events */
  forwardPluginEvent<K extends keyof PluginEventMap>(pluginEvent: K, payload: PluginEventMap[K]) {
    getPluginEventBus().publish(pluginEvent, payload);
    if (pluginEvent === "PluginInstalled") {
      this.publish("PluginInstalled", payload as SDKEventMap["PluginInstalled"]);
    }
  }

  clear(event?: SDKEventName) {
    if (event) this.handlers.delete(event);
    else this.handlers.clear();
  }

  dispose() {
    this.pluginBridge.forEach((fn) => fn());
    this.handlers.clear();
  }
}

let bus: SDKEventBus | null = null;

export function getSDKEventBus(): SDKEventBus {
  if (!bus) bus = new SDKEventBus();
  return bus;
}
