/** OmniMind Ecosystem OS — HTTP client (production backend). */

import type {
  BackgroundAgentJob,
  EcosystemActivity,
  LiveNotification,
  SidebarPin,
  SystemResourceSnapshot,
} from "./types";

const BASE = "/api/v1/omnicore/ecosystem";

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

async function post<T>(path: string, body: unknown): Promise<T | null> {
  if (typeof fetch === "undefined") return null;
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function put<T>(path: string, body: unknown): Promise<T | null> {
  if (typeof fetch === "undefined") return null;
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const omniEcosystemApiClient = {
  fetchDashboard() {
    return get<{ ok: boolean; dashboard: Record<string, unknown> }>("/dashboard");
  },

  fetchSystem() {
    return get<{ ok: boolean; system: SystemResourceSnapshot }>("/system");
  },

  listActivity() {
    return get<{ ok: boolean; items: EcosystemActivity[] }>("/activity");
  },

  pushActivity(item: Omit<EcosystemActivity, "id" | "createdAt" | "updatedAt">) {
    return post<{ ok: boolean; item: EcosystemActivity }>("/activity", item);
  },

  listBackgroundAgents() {
    return get<{ ok: boolean; jobs: BackgroundAgentJob[] }>("/background-agents");
  },

  enqueueBackgroundAgent(job: Omit<BackgroundAgentJob, "id" | "createdAt" | "updatedAt" | "progress" | "status">) {
    return post<{ ok: boolean; job: BackgroundAgentJob }>("/background-agents", job);
  },

  listAITasks() {
    return get<{ ok: boolean; tasks: import("./types").AITaskRecord[] }>("/ai-tasks");
  },

  listNotifications() {
    return get<{ ok: boolean; notifications: LiveNotification[] }>("/notifications");
  },

  saveSidebar(pins: SidebarPin[]) {
    return put<{ ok: boolean }>("/sidebar", { pins });
  },

  loadSidebar() {
    return get<{ ok: boolean; pins: SidebarPin[] }>("/sidebar");
  },
};
