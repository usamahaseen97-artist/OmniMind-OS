import { resolveApiBaseUrl } from "./api-config";

const PROBE_MS = 4500;

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

async function probePlatformReadiness(base: string, signal?: AbortSignal): Promise<boolean> {
  try {
    const res = await fetch(`${base}/api/v1/platform/readiness`, {
      signal,
      cache: "no-store",
      mode: "cors",
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Canonical backend liveness probe — proxy mode, platform readiness, then gateway/root fallback.
 * Import from here or `backend-url` (re-exported for backward compatibility).
 */
export async function probeBackendOnline(signal?: AbortSignal): Promise<boolean> {
  const ctrl = new AbortController();
  const timeout =
    typeof window !== "undefined" ? window.setTimeout(() => ctrl.abort(), PROBE_MS) : undefined;
  if (signal) {
    if (signal.aborted) ctrl.abort();
    else signal.addEventListener("abort", () => ctrl.abort(), { once: true });
  }

  try {
    if (
      typeof window !== "undefined" &&
      process.env.NEXT_PUBLIC_USE_API_PROXY === "true"
    ) {
      try {
        const r = await fetch("/omni-api/", { signal: ctrl.signal, cache: "no-store" });
        if (r.ok) return true;
      } catch {
        /* fall through */
      }
    }

    const base = resolveApiBaseUrl();
    if (await probePlatformReadiness(base, ctrl.signal)) return true;
    if (await probeBackendGateway(base, ctrl.signal)) return true;
    return probeBackendRoot(base, ctrl.signal);
  } catch {
    return false;
  } finally {
    if (timeout !== undefined) window.clearTimeout(timeout);
  }
}
