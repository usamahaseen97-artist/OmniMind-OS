import { getBackendUrl } from "./backend-url";
import type { SovereignToolDef } from "./sovereign-tool-registry";

export type ToolApiStatus = {
  online: boolean;
  endpoint: string;
  status: number;
  hint?: string;
};

export async function probeToolEndpoint(
  tool: SovereignToolDef,
  signal?: AbortSignal,
): Promise<ToolApiStatus> {
  const base = getBackendUrl();
  const path = tool.apiProbe ?? "/api/v1/platform/readiness";
  const url = `${base}${path}`;
  try {
    const method = path.includes("telemetry") || path.includes("dispatch") ? "OPTIONS" : "GET";
    const res = await fetch(url, {
      method: method === "OPTIONS" ? "GET" : "GET",
      signal,
      cache: "no-store",
    });
    return {
      online: res.ok || res.status === 405 || res.status === 422,
      endpoint: path,
      status: res.status,
      hint: res.ok ? "Connected" : `HTTP ${res.status}`,
    };
  } catch {
    return { online: false, endpoint: path, status: 0, hint: "Backend unreachable" };
  }
}

export async function fetchPlatformOnline(signal?: AbortSignal): Promise<boolean> {
  const { probeBackendOnline } = await import("./backend-health");
  return probeBackendOnline(signal);
}
