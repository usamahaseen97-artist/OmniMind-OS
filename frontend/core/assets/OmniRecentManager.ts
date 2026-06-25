/** Recent files and projects — asset platform scope. */
export class OmniRecentManager {
  items: { id: string; label: string; type: "file" | "project"; accessedAt: string }[] = [];

  push(type: "file" | "project", id: string, label: string) {
    const existing = this.items.find((i) => i.id === id);
    if (existing) {
      existing.accessedAt = new Date().toISOString();
      return existing;
    }
    const item = { id, label, type, accessedAt: new Date().toISOString() };
    this.items.unshift(item);
    if (this.items.length > 50) this.items.length = 50;
    return item;
  }

  files(limit = 20) {
    return this.items.filter((i) => i.type === "file").slice(0, limit);
  }

  projects(limit = 10) {
    return this.items.filter((i) => i.type === "project").slice(0, limit);
  }
}

export const omniRecentManager = new OmniRecentManager();
