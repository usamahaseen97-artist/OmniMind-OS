/** OmniCore HTTP client for core layer — real backend only (no mocks). */

import type { AiCompletionResult, CompleteOptions } from "../shared/ai-gateway-types";
import type { OmniProject, OmniSession, OmniSetting, RecentItem, SearchResult } from "./types";
import { apiGet, apiPost, apiPut } from "../shared/api-fetch";

const BASE = "/api/v1/omnicore";
const AI_BASE = "/api/v1/omnicore/ai";

export const omniCoreApiClient = {
  async complete(prompt: string, options: CompleteOptions = {}): Promise<AiCompletionResult | null> {
    const data = await apiPost<{
      ok: boolean;
      result?: { text: string; providerId?: string; modelId?: string; jobId?: string; latencyMs?: number };
    }>(`${AI_BASE}/complete`, { prompt, options });
    if (!data?.ok || !data.result?.text) return null;
    const text = data.result.text;
    return {
      jobId: data.result.jobId ?? `api-${Date.now()}`,
      response: { text, markdown: text, structured: null },
      modelId: data.result.modelId ?? "auto",
      providerId: (data.result.providerId ?? "google") as AiCompletionResult["providerId"],
      usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
      costUsd: 0,
      latencyMs: data.result.latencyMs ?? 0,
    };
  },

  async syncPlatform(bundle: {
    settings: OmniSetting[];
    memory: unknown[];
    workspacePresets: unknown[];
    plugins: unknown[];
  }) {
    await apiPut(`${BASE}/settings`, { settings: bundle.settings });
    await apiPut(`${AI_BASE}/memory`, { entries: bundle.memory });
    await apiPut(`${BASE}/search/index`, {
      items: bundle.plugins.map((p: unknown) => {
        const row = p as { id?: string; name?: string };
        return {
          id: `sr-plugin-${row.id ?? "unknown"}`,
          kind: "plugin",
          title: row.name ?? row.id ?? "plugin",
          subtitle: "plugin",
          score: 0.8,
        };
      }),
    });
    return { ok: true };
  },

  listProjects() {
    return apiGet<{ ok: boolean; projects: OmniProject[] }>(`${BASE}/projects`);
  },

  saveProjects(projects: OmniProject[]) {
    return apiPut<{ ok: boolean }>(`${BASE}/projects`, { projects });
  },

  search(query: string) {
    return apiGet<{ ok: boolean; results: SearchResult[] }>(`${BASE}/search?q=${encodeURIComponent(query)}`);
  },

  saveSession(session: OmniSession) {
    return apiPut<{ ok: boolean }>(`${BASE}/sessions`, session);
  },

  saveWorkspace(projectId: string, state: unknown) {
    return apiPut<{ ok: boolean }>(`${BASE}/workspaces/${projectId}`, state);
  },

  saveSettings(settings: OmniSetting[]) {
    return apiPut<{ ok: boolean }>(`${BASE}/settings`, { settings });
  },

  listRecent() {
    return apiGet<{ ok: boolean; items: RecentItem[] }>(`${BASE}/recent`);
  },

  saveRecent(items: RecentItem[]) {
    return apiPut<{ ok: boolean }>(`${BASE}/recent`, { items });
  },
};
