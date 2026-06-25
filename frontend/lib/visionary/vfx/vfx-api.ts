import type { VFXExportJob, VFXProject } from "./types";

const BASE = "/api/v1/visionary/vfx";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new Error(`Visionary VFX API ${res.status}`);
  return res.json() as Promise<T>;
}

export const visionaryVfxApi = {
  loadProject(id: string) {
    return request<{ ok: boolean; project: VFXProject }>(`/projects/${id}`);
  },

  saveProject(project: VFXProject) {
    return request<{ ok: boolean; project: VFXProject }>(`/projects/${project.id}`, {
      method: "PUT",
      body: JSON.stringify(project),
    });
  },

  serializeGraph(project: VFXProject) {
    return request<{ ok: boolean; serialized: string }>("/graph/serialize", {
      method: "POST",
      body: JSON.stringify({
        nodes: project.nodes,
        connections: project.connections,
        groups: project.groups,
      }),
    });
  },

  listPresets() {
    return request<{ ok: boolean; effects: unknown[]; animations: unknown[] }>("/presets");
  },

  listAssets() {
    return request<{ ok: boolean; assets: unknown[] }>("/assets");
  },

  queueExport(job: Partial<VFXExportJob>) {
    return request<{ ok: boolean; job: VFXExportJob }>("/export/queue", {
      method: "POST",
      body: JSON.stringify(job),
    });
  },
};
