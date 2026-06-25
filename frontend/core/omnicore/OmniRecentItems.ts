import type { OmniToolSlug, RecentItem, RecentItemKind } from "./types";

const MAX_RECENT = 50;

/** Recent projects, files, tools, commands. */
export class OmniRecentItems {
  items: RecentItem[] = [
    { id: "r-1", kind: "tool", label: "OmniForge Engine", toolSlug: "omniforge-engine", accessedAt: new Date().toISOString() },
    { id: "r-2", kind: "project", label: "OmniForge Workspace", toolSlug: "omniforge-engine", accessedAt: new Date().toISOString() },
  ];

  list(limit = MAX_RECENT) {
    return [...this.items]
      .sort((a, b) => b.accessedAt.localeCompare(a.accessedAt))
      .slice(0, limit);
  }

  push(kind: RecentItemKind, label: string, toolSlug: OmniToolSlug | null = null) {
    const existing = this.items.find((i) => i.kind === kind && i.label === label);
    if (existing) {
      existing.accessedAt = new Date().toISOString();
      return existing;
    }
    const item: RecentItem = {
      id: `r-${Date.now()}`,
      kind,
      label,
      toolSlug,
      accessedAt: new Date().toISOString(),
    };
    this.items.unshift(item);
    if (this.items.length > MAX_RECENT) this.items.length = MAX_RECENT;
    return item;
  }

  clear() {
    this.items = [];
  }
}

export const omniRecentItems = new OmniRecentItems();
