/** Fast recent-project cache for workspace restore (Desktop UX). */

const STORAGE_KEY = "omnimind:recent-projects-cache";
const MAX = 20;

export type RecentProjectCacheEntry = {
  id: string;
  name: string;
  toolSlug: string;
  openedAt: string;
};

export const recentProjectCache = {
  list(): RecentProjectCacheEntry[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as RecentProjectCacheEntry[]) : [];
    } catch {
      return [];
    }
  },

  touch(entry: Omit<RecentProjectCacheEntry, "openedAt">) {
    if (typeof window === "undefined") return;
    const next: RecentProjectCacheEntry[] = [
      { ...entry, openedAt: new Date().toISOString() },
      ...this.list().filter((e) => e.id !== entry.id),
    ].slice(0, MAX);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  },

  clear() {
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
  },
};
