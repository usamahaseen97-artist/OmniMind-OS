import type { MultiAgentId, MultiAgentResponse } from "../types";

/** Session and conversation caching for low-latency responses */
export class ConversationCache {
  private sessions = new Map<string, { result: MultiAgentResponse; expiresAt: number }>();
  private ttlMs = 3 * 60 * 1000;

  private key(patientId: string, agentIds?: MultiAgentId[]) {
    return `ma:${patientId}:${(agentIds ?? []).sort().join(",")}`;
  }

  getSession<T = MultiAgentResponse>(patientId: string, agentIds?: MultiAgentId[]): T | null {
    const entry = this.sessions.get(this.key(patientId, agentIds));
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.sessions.delete(this.key(patientId, agentIds));
      return null;
    }
    return entry.result as T;
  }

  setSession(patientId: string, agentIds: MultiAgentId[] | undefined, result: MultiAgentResponse) {
    this.sessions.set(this.key(patientId, agentIds), { result, expiresAt: Date.now() + this.ttlMs });
  }

  invalidate(patientId: string) {
    for (const k of this.sessions.keys()) {
      if (k.startsWith(`ma:${patientId}:`)) this.sessions.delete(k);
    }
  }
}

let cache: ConversationCache | null = null;

export function getConversationCache() {
  if (!cache) cache = new ConversationCache();
  return cache;
}
