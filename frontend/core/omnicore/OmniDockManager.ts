import type { DockSlot, DockState } from "./types";

/** Dock regions for panels — left, right, bottom, top. */
export class OmniDockManager {
  state: DockState = {
    slots: [
      { id: "dock-left", panelId: "explorer", region: "left", size: 240, collapsed: false },
      { id: "dock-right", panelId: "inspector", region: "right", size: 280, collapsed: false },
      { id: "dock-bottom", panelId: "terminal", region: "bottom", size: 180, collapsed: true },
    ],
    activePanelId: "explorer",
  };

  snapshot(): DockState {
    return structuredClone(this.state);
  }

  restore(state: DockState) {
    this.state = structuredClone(state);
  }

  dock(panelId: string, region: DockSlot["region"], size = 240) {
    const existing = this.state.slots.find((s) => s.panelId === panelId);
    if (existing) {
      existing.region = region;
      existing.size = size;
      existing.collapsed = false;
    } else {
      this.state.slots.push({
        id: `dock-${Date.now()}`,
        panelId,
        region,
        size,
        collapsed: false,
      });
    }
    this.state.activePanelId = panelId;
    return this.state;
  }

  undock(panelId: string) {
    this.state.slots = this.state.slots.filter((s) => s.panelId !== panelId);
    if (this.state.activePanelId === panelId) {
      this.state.activePanelId = this.state.slots[0]?.panelId ?? null;
    }
    return this.state;
  }

  toggleCollapse(panelId: string) {
    const slot = this.state.slots.find((s) => s.panelId === panelId);
    if (slot) slot.collapsed = !slot.collapsed;
    return slot ?? null;
  }

  resize(panelId: string, size: number) {
    const slot = this.state.slots.find((s) => s.panelId === panelId);
    if (slot) slot.size = size;
    return slot ?? null;
  }
}

export const omniDockManager = new OmniDockManager();
