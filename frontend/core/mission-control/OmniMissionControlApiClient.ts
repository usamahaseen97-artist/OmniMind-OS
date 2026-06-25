/** Mission Control HTTP client — production backend. */

import type {
  AnalyticsSeries,
  MissionControlDashboard,
  SecurityCenterSnapshot,
  SystemLogEntry,
  TerminalLine,
} from "./types";

const BASE = "/api/v1/omnicore/mission-control";

async function get<T>(path: string): Promise<T | null> {
  if (typeof fetch === "undefined") return null;
  try {
    const res = await fetch(`${BASE}${path}`);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function post<T>(path: string, body?: unknown): Promise<T | null> {
  if (typeof fetch === "undefined") return null;
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const omniMissionControlApiClient = {
  fetchDashboard() {
    return get<{ ok: boolean; dashboard: MissionControlDashboard }>("/dashboard");
  },

  fetchSystem() {
    return get<{ ok: boolean; system: MissionControlDashboard["system"] }>("/system");
  },

  fetchLogs(source?: string) {
    const q = source ? `?source=${encodeURIComponent(source)}` : "";
    return get<{ ok: boolean; logs: SystemLogEntry[] }>(`/logs${q}`);
  },

  appendLog(entry: Omit<SystemLogEntry, "id" | "at">) {
    return post<{ ok: boolean }>("/logs", entry);
  },

  fetchTerminals() {
    return get<{ ok: boolean; lines: TerminalLine[] }>("/terminals");
  },

  fetchAnalytics() {
    return get<{ ok: boolean; series: AnalyticsSeries[] }>("/analytics");
  },

  fetchSecurity() {
    return get<{ ok: boolean; security: SecurityCenterSnapshot }>("/security");
  },

  agentControl(agentId: string, action: "pause" | "resume" | "cancel" | "retry" | "duplicate" | "priority", payload?: unknown) {
    return post<{ ok: boolean }>(`/agents/${agentId}/${action}`, payload);
  },

  runQuickAction(actionId: string) {
    return post<{ ok: boolean; result?: unknown }>(`/actions/${actionId}`);
  },
};
