import type { AutomationProject } from "./types";

const BASE = "/api/v1/visionary/automation";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new Error(`Visionary Automation API ${res.status}`);
  return res.json() as Promise<T>;
}

export const visionaryAutomationApi = {
  loadProject(id: string) {
    return request<{ ok: boolean; project: AutomationProject }>(`/projects/${id}`);
  },

  saveProject(project: AutomationProject) {
    return request<{ ok: boolean; project: AutomationProject }>(`/projects/${project.id}`, {
      method: "PUT",
      body: JSON.stringify(project),
    });
  },

  serializeWorkflow(workflow: unknown) {
    return request<{ ok: boolean; serialized: string }>("/workflows/serialize", {
      method: "POST",
      body: JSON.stringify(workflow),
    });
  },

  queuePublish(job: Record<string, unknown>) {
    return request<{ ok: boolean; job: unknown }>("/publishing/queue", {
      method: "POST",
      body: JSON.stringify(job),
    });
  },

  searchAssets(q: string) {
    return request<{ ok: boolean; results: unknown[] }>(`/assets/search?q=${encodeURIComponent(q)}`);
  },

  listPlugins() {
    return request<{ ok: boolean; plugins: unknown[] }>("/plugins");
  },
};
