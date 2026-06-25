import { omniEventBus } from "../omnicore/OmniEventBus";
import { omniAI } from "../ai/OmniAI";
import { omniAssets } from "../assets/OmniAssets";
import { omniRecentItems } from "../omnicore/OmniRecentItems";
import type { HubConnection } from "./types";
import type { OmniToolSlug } from "../omnicore/types";

export type HubToolSlot = {
  id: string;
  toolSlug: OmniToolSlug | string;
  label: string;
  href: string;
  order: number;
};

/** OmniMindHub — central tool switcher with shared memory, assets, history, AI. */
export class OmniMindHub {
  slots: HubToolSlot[] = [];
  connections: HubConnection[] = [];
  dragSourceId: string | null = null;

  registerTool(slot: Omit<HubToolSlot, "order">) {
    const existing = this.slots.find((s) => s.id === slot.id);
    if (existing) {
      Object.assign(existing, slot);
      return existing;
    }
    const entry: HubToolSlot = { ...slot, order: this.slots.length };
    this.slots.push(entry);
    this.ensureConnection(slot.toolSlug);
    omniEventBus.publish("hub:tool-registered", { toolSlug: slot.toolSlug });
    return entry;
  }

  private ensureConnection(toolSlug: OmniToolSlug | string) {
    if (this.connections.some((c) => c.fromTool === toolSlug || c.toTool === toolSlug)) return;
    this.connections.push({
      fromTool: toolSlug,
      toTool: "omnimind",
      sharedMemory: true,
      sharedAssets: true,
      sharedHistory: true,
      sharedAI: true,
    });
  }

  reorder(fromId: string, toId: string) {
    const fromIdx = this.slots.findIndex((s) => s.id === fromId);
    const toIdx = this.slots.findIndex((s) => s.id === toId);
    if (fromIdx < 0 || toIdx < 0) return;
    const [moved] = this.slots.splice(fromIdx, 1);
    this.slots.splice(toIdx, 0, moved);
    this.slots.forEach((s, i) => {
      s.order = i;
    });
    omniEventBus.publish("hub:reorder", { fromId, toId });
  }

  switchTool(toolSlug: OmniToolSlug | string) {
    omniEventBus.publish("hub:switch", { toolSlug });
    omniRecentItems.push("tool", String(toolSlug), toolSlug as OmniToolSlug);
    return { toolSlug, shared: this.sharedContext(toolSlug) };
  }

  sharedContext(toolSlug: OmniToolSlug | string) {
    return {
      memory: omniAI.memory.list().filter((m) => !m.toolSlug || m.toolSlug === toolSlug),
      assets: omniAssets.assets.assets.filter((a) => !a.toolSlug || a.toolSlug === toolSlug),
      conversations: omniAI.conversations.list().filter((c) => c.toolSlug === toolSlug),
      history: omniRecentItems.list(20),
    };
  }

  snapshot() {
    return {
      slots: [...this.slots],
      connections: [...this.connections],
      dragSourceId: this.dragSourceId,
    };
  }
}

export const omniMindHub = new OmniMindHub();
