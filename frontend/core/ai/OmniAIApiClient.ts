import type { CompleteOptions } from "./types";
import type { AiAgent, Conversation, PromptTemplate } from "./types";
import { apiGet, apiPost, apiPut } from "../shared/api-fetch";

const BASE = "/api/v1/omnicore/ai";

export const omniAIApiClient = {
  listAgents() {
    return apiGet<{ ok: boolean; agents: AiAgent[] }>(`${BASE}/agents`);
  },

  saveAgents(agents: AiAgent[]) {
    return apiPut<{ ok: boolean }>(`${BASE}/agents`, { agents });
  },

  listPrompts() {
    return apiGet<{ ok: boolean; prompts: PromptTemplate[] }>(`${BASE}/prompts`);
  },

  savePrompt(prompt: PromptTemplate) {
    return apiPost<{ ok: boolean }>(`${BASE}/prompts`, prompt);
  },

  complete(body: { prompt: string; options?: CompleteOptions }) {
    return apiPost<{ ok: boolean; result: unknown }>(`${BASE}/complete`, body);
  },

  listConversations(toolSlug?: string) {
    const q = toolSlug ? `?toolSlug=${encodeURIComponent(toolSlug)}` : "";
    return apiGet<{ ok: boolean; conversations: Conversation[] }>(`${BASE}/conversations${q}`);
  },

  saveConversation(conversation: Conversation) {
    return apiPut<{ ok: boolean }>(`${BASE}/conversations`, conversation);
  },

  listMemory(scope?: string) {
    const q = scope ? `?scope=${encodeURIComponent(scope)}` : "";
    return apiGet<{ ok: boolean; entries: unknown[] }>(`${BASE}/memory${q}`);
  },

  gatewayStatus() {
    return apiGet<{ ok: boolean; providers: unknown[]; monitoring: unknown }>(`${BASE}/gateway/status`);
  },
};
