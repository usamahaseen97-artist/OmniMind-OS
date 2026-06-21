/**
 * Single source of truth for OmniMind FastAPI base URL.
 * Default port 8001 — must match run-backend-8001.ps1 and frontend/.env.local.
 */

export const API_BASE_URL = "http://127.0.0.1:8001";

export function resolveApiBaseUrl(): string {
  if (
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_USE_API_PROXY === "true"
  ) {
    return "/omni-api";
  }

  const raw = (process.env.NEXT_PUBLIC_BACKEND_URL ?? API_BASE_URL).replace(/\/$/, "");
  if (!raw) return API_BASE_URL;

  try {
    const url = new URL(raw);
    return url.toString().replace(/\/$/, "");
  } catch {
    return API_BASE_URL;
  }
}

/** Rewrite backend URLs embedded in API payloads (stream/audio paths). */
export function normalizeBackendResourceUrl(url: string): string {
  if (!url) return url;
  const base = resolveApiBaseUrl();
  return url
    .replace(/http:\/\/127\.0\.0\.1:8000/gi, base)
    .replace(/http:\/\/localhost:8000/gi, base)
    .replace(/http:\/\/127\.0\.0\.1:8002/gi, base)
    .replace(/http:\/\/localhost:8002/gi, base)
    .replace(/http:\/\/127\.0\.0\.1:8001/gi, base)
    .replace(/http:\/\/localhost:8001/gi, base);
}
