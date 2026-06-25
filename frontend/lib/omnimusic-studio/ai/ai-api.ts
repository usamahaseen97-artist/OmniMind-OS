import type {
  GenerationJob,
  LyricsDocument,
  MusicPromptSpec,
  MusicProviderDescriptor,
} from "../ai-types";

const AI_BASE = "/api/v1/omnimusic/studio/ai";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${AI_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new Error(`OmniMusic AI API ${res.status}`);
  return res.json() as Promise<T>;
}

export const omnimusicAiApi = {
  savePrompt(prompt: MusicPromptSpec) {
    return request<{ ok: boolean; prompt: MusicPromptSpec }>("/prompts", {
      method: "POST",
      body: JSON.stringify(prompt),
    });
  },

  listPrompts(projectId: string) {
    return request<{ ok: boolean; prompts: MusicPromptSpec[] }>(`/prompts/${projectId}`);
  },

  createJob(job: Partial<GenerationJob> & { prompt: MusicPromptSpec }) {
    return request<{ ok: boolean; job: GenerationJob }>("/jobs", {
      method: "POST",
      body: JSON.stringify(job),
    });
  },

  listJobs(projectId: string) {
    return request<{ ok: boolean; jobs: GenerationJob[] }>(`/jobs/${projectId}`);
  },

  updateJob(jobId: string, patch: Partial<GenerationJob>) {
    return request<{ ok: boolean; job: GenerationJob }>(`/jobs/${jobId}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
  },

  listProviders() {
    return request<{ ok: boolean; providers: MusicProviderDescriptor[] }>("/providers");
  },

  saveLyrics(doc: LyricsDocument) {
    return request<{ ok: boolean; document: LyricsDocument }>("/lyrics", {
      method: "POST",
      body: JSON.stringify(doc),
    });
  },

  listTemplates() {
    return request<{ ok: boolean; templates: unknown[] }>("/templates");
  },

  listAssets(projectId: string) {
    return request<{ ok: boolean; assets: unknown[] }>(`/assets/${projectId}`);
  },
};
