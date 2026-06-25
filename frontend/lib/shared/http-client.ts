/** Shared HTTP client — deduplication, retry, GET cache (Infrastructure Layer). */

import { ApiError } from "../qa/api-error-handler";

export type ApiClientOptions = {
  baseUrl: string;
  label?: string;
  /** TTL for GET response cache in ms (default 30s). Set 0 to disable. */
  cacheTtlMs?: number;
  /** Max cached GET entries before LRU eviction */
  cacheMaxEntries?: number;
  /** Retry attempts on network failure (default 2) */
  retries?: number;
  /** Base delay between retries in ms */
  retryDelayMs?: number;
  /** Optional Bearer token provider — never log token values */
  getAccessToken?: () => string | null;
};

export type ApiClient = {
  get<T>(path: string, init?: RequestInit): Promise<T>;
  post<T>(path: string, body?: unknown, init?: RequestInit): Promise<T>;
  put<T>(path: string, body?: unknown, init?: RequestInit): Promise<T>;
  delete<T>(path: string, init?: RequestInit): Promise<T>;
  request<T>(path: string, init?: RequestInit): Promise<T>;
  clearCache(): void;
};

type CacheEntry = { data: unknown; expiresAt: number };

export function createApiClient({
  baseUrl,
  label = "API",
  cacheTtlMs = 30_000,
  cacheMaxEntries = 128,
  retries = 2,
  retryDelayMs = 300,
  getAccessToken,
}: ApiClientOptions): ApiClient {
  const getCache = new Map<string, CacheEntry>();
  const inflight = new Map<string, Promise<unknown>>();

  function cacheKey(path: string, init?: RequestInit) {
    return `${init?.method ?? "GET"}:${path}`;
  }

  function getCached<T>(key: string): T | null {
    const entry = getCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      getCache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  function setCache(key: string, data: unknown) {
    if (cacheTtlMs <= 0) return;
    if (getCache.size >= cacheMaxEntries) {
      const oldest = getCache.keys().next().value;
      if (oldest) getCache.delete(oldest);
    }
    getCache.set(key, { data, expiresAt: Date.now() + cacheTtlMs });
  }

  function invalidateCache() {
    getCache.clear();
  }

  async function sleep(ms: number) {
    await new Promise((r) => setTimeout(r, ms));
  }

  async function fetchOnce<T>(path: string, init?: RequestInit): Promise<T> {
    const token = getAccessToken?.();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(init?.headers as Record<string, string> | undefined),
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${baseUrl}${path}`, { ...init, headers });
    if (!res.ok) {
      let body: unknown;
      try {
        body = await res.json();
      } catch {
        body = undefined;
      }
      throw ApiError.fromResponse(res.status, body, label);
    }
    return res.json() as Promise<T>;
  }

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const method = (init?.method ?? "GET").toUpperCase();
    const key = cacheKey(path, init);

    if (method === "GET" && cacheTtlMs > 0) {
      const cached = getCached<T>(key);
      if (cached !== null) return cached;

      const pending = inflight.get(key);
      if (pending) return pending as Promise<T>;
    }

    const run = async (): Promise<T> => {
      let lastError: unknown;
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const data = await fetchOnce<T>(path, init);
          if (method === "GET" && cacheTtlMs > 0) setCache(key, data);
          if (method !== "GET") invalidateCache();
          return data;
        } catch (err) {
          lastError = err;
          const retryable = ApiError.isRetryable(err);
          if (attempt >= retries || !retryable) break;
          await sleep(retryDelayMs * (attempt + 1));
        }
      }
      throw lastError;
    };

    const promise = run();
    if (method === "GET" && cacheTtlMs > 0) {
      inflight.set(key, promise);
      promise.finally(() => inflight.delete(key));
    }
    return promise;
  }

  return {
    request,
    get: (path, init) => request(path, { ...init, method: "GET" }),
    post: (path, body, init) =>
      request(path, {
        ...init,
        method: "POST",
        body: body !== undefined ? JSON.stringify(body) : undefined,
      }),
    put: (path, body, init) =>
      request(path, {
        ...init,
        method: "PUT",
        body: body !== undefined ? JSON.stringify(body) : undefined,
      }),
    delete: (path, init) => request(path, { ...init, method: "DELETE" }),
    clearCache: invalidateCache,
  };
}
