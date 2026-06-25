import type { Studio3DAsset, Studio3DProject } from "./types";

const BASE = "/api/v1/visionary/studio3d";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new Error(`Visionary 3D API ${res.status}`);
  return res.json() as Promise<T>;
}

export const visionaryStudio3dApi = {
  loadProject(id: string) {
    return request<{ ok: boolean; project: Studio3DProject }>(`/projects/${id}`);
  },

  saveProject(project: Studio3DProject) {
    return request<{ ok: boolean; project: Studio3DProject }>(`/projects/${project.id}`, {
      method: "PUT",
      body: JSON.stringify(project),
    });
  },

  serializeScene(scene: unknown) {
    return request<{ ok: boolean; serialized: string }>("/scenes/serialize", {
      method: "POST",
      body: JSON.stringify(scene),
    });
  },

  listAssets() {
    return request<{ ok: boolean; assets: Studio3DAsset[] }>("/assets");
  },

  listCharacterPresets() {
    return request<{ ok: boolean; presets: unknown[] }>("/characters/presets");
  },

  listMaterials() {
    return request<{ ok: boolean; materials: unknown[] }>("/materials");
  },
};
