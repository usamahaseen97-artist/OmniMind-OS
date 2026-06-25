import type { ClinicalIntelligenceRequest } from "../types";

type CacheEntry<T> = { value: T; expiresAt: number };

/** TTL cache for clinical inference results */
export class InferenceCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private defaultTtlMs = 5 * 60 * 1000;

  private key(req: ClinicalIntelligenceRequest): string {
    return JSON.stringify({
      patientId: req.patientId,
      symptoms: req.symptoms,
      history: req.history,
      vitals: req.vitals,
      labPanels: req.labPanels,
      agentIds: req.agentIds,
    });
  }

  get<T>(req: ClinicalIntelligenceRequest): T | null {
    const k = this.key(req);
    const entry = this.store.get(k) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(k);
      return null;
    }
    return entry.value;
  }

  set<T>(req: ClinicalIntelligenceRequest, value: T, ttlMs = this.defaultTtlMs) {
    this.store.set(this.key(req), { value, expiresAt: Date.now() + ttlMs });
  }

  invalidate(patientId: string) {
    for (const [k] of this.store) {
      if (k.includes(`"patientId":"${patientId}"`)) this.store.delete(k);
    }
  }
}

let cache: InferenceCache | null = null;

export function getInferenceCache(): InferenceCache {
  if (!cache) cache = new InferenceCache();
  return cache;
}
