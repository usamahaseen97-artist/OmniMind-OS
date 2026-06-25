import { omniEcosystemApiClient } from "./OmniEcosystemApiClient";
import type { SidebarPin } from "./types";
import { omniRecentItems } from "../omnicore/OmniRecentItems";
import { omniEventBus } from "../omnicore/OmniEventBus";

const DEFAULT_TOOLS: SidebarPin[] = [
  { id: "pin-home", toolSlug: "omnimind", href: "/", label: "Home", pinned: true, favorite: true, order: 0 },
  { id: "pin-forge", toolSlug: "omniforge-engine", href: "/omniforge-engine", label: "OmniForge", pinned: true, favorite: true, order: 1 },
  { id: "pin-visionary", toolSlug: "creative-visionary", href: "/creative-visionary", label: "Visionary", pinned: false, favorite: true, order: 2 },
];

/** Universal collapsible sidebar state — pinned tools, favorites, recent, cloud. */
export class OmniUniversalSidebar {
  collapsed = false;
  pins: SidebarPin[] = [...DEFAULT_TOOLS];
  private booted = false;

  async boot() {
    if (this.booted) return this;
    const remote = await omniEcosystemApiClient.loadSidebar();
    if (remote?.ok && remote.pins.length) this.pins = remote.pins;
    this.booted = true;
    return this;
  }

  toggle() {
    this.collapsed = !this.collapsed;
    omniEventBus.publish("sidebar:toggle", { collapsed: this.collapsed });
    return this.collapsed;
  }

  pin(item: Omit<SidebarPin, "order">) {
    const existing = this.pins.find((p) => p.id === item.id);
    if (existing) {
      Object.assign(existing, item);
    } else {
      this.pins.push({ ...item, order: this.pins.length });
    }
    void this.persist();
    return item;
  }

  unpin(id: string) {
    this.pins = this.pins.filter((p) => p.id !== id);
    void this.persist();
  }

  favorites() {
    return this.pins.filter((p) => p.favorite).sort((a, b) => a.order - b.order);
  }

  pinned() {
    return this.pins.filter((p) => p.pinned).sort((a, b) => a.order - b.order);
  }

  recent() {
    return omniRecentItems.list(12);
  }

  private async persist() {
    await omniEcosystemApiClient.saveSidebar(this.pins);
  }

  snapshot() {
    return { collapsed: this.collapsed, pins: this.pins, favorites: this.favorites(), pinned: this.pinned() };
  }
}

export const omniUniversalSidebar = new OmniUniversalSidebar();
