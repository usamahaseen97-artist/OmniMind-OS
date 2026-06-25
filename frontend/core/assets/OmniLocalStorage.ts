import type { StorageKey } from "./types";

/** Browser/local key-value workspace storage. */
export class OmniLocalStorage {
  private memory = new Map<StorageKey, string>();

  set(key: StorageKey, value: unknown) {
    const serialized = JSON.stringify(value);
    this.memory.set(key, serialized);
    if (typeof localStorage !== "undefined") {
      try { localStorage.setItem(`omnicore:${key}`, serialized); } catch { /* quota */ }
    }
    return true;
  }

  get<T>(key: StorageKey, fallback: T): T {
    if (this.memory.has(key)) {
      try { return JSON.parse(this.memory.get(key)!) as T; } catch { return fallback; }
    }
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(`omnicore:${key}`);
      if (raw) {
        try { return JSON.parse(raw) as T; } catch { return fallback; }
      }
    }
    return fallback;
  }

  remove(key: StorageKey) {
    this.memory.delete(key);
    if (typeof localStorage !== "undefined") localStorage.removeItem(`omnicore:${key}`);
  }

  keys(prefix = "") {
    const keys: string[] = [];
    this.memory.forEach((_, k) => { if (k.startsWith(prefix)) keys.push(k); });
    return keys;
  }
}

export const omniLocalStorage = new OmniLocalStorage();
