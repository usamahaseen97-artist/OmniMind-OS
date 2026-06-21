import { getBackendUrl } from "./backend-url";

const PROBE_MS = 4500;

/** Fast liveness check — platform readiness (always HTTP 200 when API is up). */
export async function probeBackendOnline(signal?: AbortSignal): Promise<boolean> {
  const ctrl = new AbortController();
  const timeout =
    typeof window !== "undefined" ? window.setTimeout(() => ctrl.abort(), PROBE_MS) : undefined;
  if (signal) {
    if (signal.aborted) ctrl.abort();
    else signal.addEventListener("abort", () => ctrl.abort(), { once: true });
  }

  try {
    const base = getBackendUrl();
    const res = await fetch(`${base}/api/v1/platform/readiness`, {
      signal: ctrl.signal,
      cache: "no-store",
      mode: "cors",
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    if (timeout !== undefined) window.clearTimeout(timeout);
  }
}
