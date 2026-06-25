import type { OmniAsset, UniversalProject } from "../assets/types";
import { apiGet, apiPost, apiPut } from "../shared/api-fetch";

const BASE = "/api/v1/omnicore/assets";

export const omniAssetsApiClient = {
  listProjects() {
    return apiGet<{ ok: boolean; projects: UniversalProject[] }>(`${BASE}/projects`);
  },
  saveProjects(projects: UniversalProject[]) {
    return apiPut<{ ok: boolean }>(`${BASE}/projects`, { projects });
  },
  listAssets(projectId?: string) {
    const q = projectId ? `?projectId=${encodeURIComponent(projectId)}` : "";
    return apiGet<{ ok: boolean; assets: OmniAsset[] }>(`${BASE}/assets${q}`);
  },
  saveAsset(asset: OmniAsset) {
    return apiPost<{ ok: boolean }>(`${BASE}/assets`, asset);
  },
  search(query: string) {
    return apiGet<{ ok: boolean; results: unknown[] }>(`${BASE}/search?q=${encodeURIComponent(query)}`);
  },
  listVersions(targetId: string) {
    return apiGet<{ ok: boolean; versions: unknown[] }>(`${BASE}/versions/${targetId}`);
  },
  createBackup(label: string) {
    return apiPost<{ ok: boolean }>(`${BASE}/backups`, { label });
  },
};
