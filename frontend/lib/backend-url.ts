/**
 * Backend URL — single active FastAPI port (8001).
 */

import { API_BASE_URL, resolveApiBaseUrl } from "./api-config";

export { API_BASE_URL, normalizeBackendResourceUrl, resolveApiBaseUrl } from "./api-config";

const LEGACY_STORAGE_KEYS = ["omnimind_backend_url", "omnimind_backend_url_8001"];

function purgeLegacyBackendPortsFromStorage(): void {
  if (typeof window === "undefined") return;

  const badPort = /:800[02](?:\/|$)/i;

  for (const storage of [sessionStorage, localStorage]) {
    for (let i = storage.length - 1; i >= 0; i -= 1) {
      const key = storage.key(i);
      if (!key) continue;
      const value = storage.getItem(key);
      const legacyKey = LEGACY_STORAGE_KEYS.includes(key) || key.startsWith("omnimind_backend");
      if (legacyKey || (value && badPort.test(value))) {
        storage.removeItem(key);
      }
    }
  }
}

export function resetBackendUrlCache(): void {
  purgeLegacyBackendPortsFromStorage();
}

export function getBackendUrl(): string {
  if (typeof window !== "undefined") {
    purgeLegacyBackendPortsFromStorage();
  }
  return resolveApiBaseUrl();
}

export function getApiBaseUrl(): string {
  return getBackendUrl();
}

export async function resolveBackendUrl(_signal?: AbortSignal): Promise<string> {
  return getBackendUrl();
}

async function probeBackendRoot(base: string, signal?: AbortSignal): Promise<boolean> {
  try {
    const r = await fetch(`${base}/`, { signal, cache: "no-store", mode: "cors" });
    return r.ok;
  } catch {
    return false;
  }
}

async function probeBackendGateway(base: string, signal?: AbortSignal): Promise<boolean> {
  try {
    const r = await fetch(`${base}/api/v1/gateway/providers`, {
      signal,
      cache: "no-store",
      mode: "cors",
    });
    return r.ok;
  } catch {
    return false;
  }
}

export async function probeBackendOnline(signal?: AbortSignal): Promise<boolean> {
  if (
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_USE_API_PROXY === "true"
  ) {
    try {
      const r = await fetch("/omni-api/", { signal, cache: "no-store" });
      return r.ok;
    } catch {
      return false;
    }
  }

  const base = resolveApiBaseUrl();
  return (
    (await probeBackendGateway(base, signal)) || (await probeBackendRoot(base, signal))
  );
}
