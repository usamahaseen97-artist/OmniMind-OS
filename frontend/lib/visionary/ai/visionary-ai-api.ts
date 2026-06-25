import type {
  BrandKit,
  GenerationJob,
  GenerationRecord,
  PromptDraft,
  VisionaryAIProject,
  VisionaryAsset,
} from "./types";

const BASE = "/api/v1/visionary/ai";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new Error(`Visionary AI API ${res.status}`);
  return res.json() as Promise<T>;
}

export const visionaryAiApi = {
  enqueueJob(job: GenerationJob) {
    return request<{ ok: boolean; job: GenerationJob }>("/queue", {
      method: "POST",
      body: JSON.stringify(job),
    });
  },

  fetchQueue() {
    return request<{ ok: boolean; jobs: GenerationJob[] }>("/queue");
  },

  pauseJob(id: string) {
    return request<{ ok: boolean }>(`/queue/${id}/pause`, { method: "POST" });
  },

  resumeJob(id: string) {
    return request<{ ok: boolean }>(`/queue/${id}/resume`, { method: "POST" });
  },

  cancelJob(id: string) {
    return request<{ ok: boolean }>(`/queue/${id}/cancel`, { method: "POST" });
  },

  fetchHistory(projectId?: string) {
    const q = projectId ? `?project_id=${encodeURIComponent(projectId)}` : "";
    return request<{ ok: boolean; records: GenerationRecord[] }>(`/history${q}`);
  },

  recordHistory(record: GenerationRecord) {
    return request<{ ok: boolean }>("/history", {
      method: "POST",
      body: JSON.stringify(record),
    });
  },

  optimizePrompt(draft: PromptDraft) {
    return request<{ ok: boolean; optimized: PromptDraft; suggestions: string[]; score: number }>(
      "/prompts/optimize",
      { method: "POST", body: JSON.stringify(draft) },
    );
  },

  fetchTemplates() {
    return request<{ ok: boolean; templates: unknown[] }>("/templates");
  },

  fetchAssets(projectId?: string) {
    const q = projectId ? `?project_id=${encodeURIComponent(projectId)}` : "";
    return request<{ ok: boolean; assets: VisionaryAsset[] }>(`/assets${q}`);
  },

  fetchBrandKit(projectId: string) {
    return request<{ ok: boolean; brandKit: BrandKit }>(`/brand-kit/${projectId}`);
  },

  saveBrandKit(brandKit: BrandKit) {
    return request<{ ok: boolean; brandKit: BrandKit }>("/brand-kit", {
      method: "POST",
      body: JSON.stringify(brandKit),
    });
  },

  listProjects() {
    return request<{ ok: boolean; projects: VisionaryAIProject[] }>("/projects");
  },

  createProject(body: Partial<VisionaryAIProject>) {
    return request<{ ok: boolean; project: VisionaryAIProject }>("/projects", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  syncCloud(projectId: string) {
    return request<{ ok: boolean; state: unknown }>("/cloud/sync", {
      method: "POST",
      body: JSON.stringify({ project_id: projectId }),
    });
  },
};
