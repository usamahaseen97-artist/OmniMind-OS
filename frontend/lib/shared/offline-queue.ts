/** Offline mutation queue — persists failed writes for background sync. */

const STORAGE_KEY = "omnimind:offline-queue";

export type OfflineQueueEntry = {
  id: string;
  url: string;
  method: string;
  body: string | null;
  createdAt: string;
  retries: number;
};

export class OfflineQueue {
  private maxEntries = 200;

  list(): OfflineQueueEntry[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as OfflineQueueEntry[]) : [];
    } catch {
      return [];
    }
  }

  private save(entries: OfflineQueueEntry[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, this.maxEntries)));
  }

  enqueue(url: string, method: string, body?: unknown) {
    const entry: OfflineQueueEntry = {
      id: `oq-${Date.now()}`,
      url,
      method,
      body: body !== undefined ? JSON.stringify(body) : null,
      createdAt: new Date().toISOString(),
      retries: 0,
    };
    this.save([entry, ...this.list()]);
    return entry;
  }

  async flush(processor?: (entry: OfflineQueueEntry) => Promise<boolean>) {
    const remaining: OfflineQueueEntry[] = [];
    for (const entry of this.list()) {
      const ok = processor
        ? await processor(entry)
        : await fetch(entry.url, {
            method: entry.method,
            headers: { "Content-Type": "application/json" },
            body: entry.body,
          }).then((r) => r.ok);
      if (!ok) {
        remaining.push({ ...entry, retries: entry.retries + 1 });
      }
    }
    this.save(remaining.filter((e) => e.retries < 5));
    return { processed: this.list().length - remaining.length, remaining: remaining.length };
  }

  clear() {
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
  }
}

export const offlineQueue = new OfflineQueue();
