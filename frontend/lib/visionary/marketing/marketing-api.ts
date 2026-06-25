import type { MarketingProject } from "./types";

const BASE = "/api/v1/visionary/marketing";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new Error(`Visionary Marketing API ${res.status}`);
  return res.json() as Promise<T>;
}

export const visionaryMarketingApi = {
  loadProject(id: string) {
    return request<{ ok: boolean; project: MarketingProject }>(`/projects/${id}`);
  },

  saveProject(project: MarketingProject) {
    return request<{ ok: boolean; project: MarketingProject }>(`/projects/${project.id}`, {
      method: "PUT",
      body: JSON.stringify(project),
    });
  },

  listAssets() {
    return request<{ ok: boolean; assets: unknown[] }>("/assets");
  },

  queuePublish(job: Record<string, unknown>) {
    return request<{ ok: boolean; job: unknown }>("/publishing/queue", {
      method: "POST",
      body: JSON.stringify(job),
    });
  },

  getAnalytics(campaignId: string) {
    return request<{ ok: boolean; snapshots: unknown[] }>(`/analytics/${campaignId}`);
  },

  listPresets() {
    return request<{ ok: boolean; templates: unknown[]; prompts: unknown[] }>("/presets");
  },
};
