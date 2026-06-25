import type { MemoryEntry, MemoryScope } from "./types";

const MAX_ENTRIES = 500;

/** Multi-scope memory architecture — session, project, long-term, etc. */
export class OmniMemory {
  entries: MemoryEntry[] = [];

  set(scope: MemoryScope, key: string, value: unknown, opts?: { toolSlug?: string | null; projectId?: string | null }) {
    const existing = this.entries.find(
      (e) => e.scope === scope && e.key === key && e.toolSlug === (opts?.toolSlug ?? null),
    );
    if (existing) {
      existing.value = value;
      existing.updatedAt = new Date().toISOString();
      return existing;
    }
    this.evictIfNeeded();
    const entry: MemoryEntry = {
      id: `mem-${Date.now()}`,
      scope,
      key,
      value,
      toolSlug: opts?.toolSlug ?? null,
      projectId: opts?.projectId ?? null,
      updatedAt: new Date().toISOString(),
    };
    this.entries.push(entry);
    return entry;
  }

  get(scope: MemoryScope, key: string, toolSlug: string | null = null) {
    return this.entries.find((e) => e.scope === scope && e.key === key && e.toolSlug === toolSlug) ?? null;
  }

  list(scope?: MemoryScope, toolSlug?: string) {
    return this.entries.filter((e) => {
      if (scope && e.scope !== scope) return false;
      if (toolSlug && e.toolSlug !== toolSlug) return false;
      return true;
    });
  }

  clearScope(scope: MemoryScope) {
    this.entries = this.entries.filter((e) => e.scope !== scope);
  }

  private evictIfNeeded() {
    if (this.entries.length < MAX_ENTRIES) return;
    this.entries.sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
    this.entries = this.entries.slice(-Math.floor(MAX_ENTRIES * 0.8));
  }
}

export const omniMemory = new OmniMemory();
