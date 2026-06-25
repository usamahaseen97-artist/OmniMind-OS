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

/** @deprecated Import `probeBackendOnline` from `./backend-health` — re-exported for compatibility. */
export { probeBackendOnline } from "./backend-health";
