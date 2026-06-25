import type { AiProvider, AiProviderId } from "./types";
import { AI_PROVIDERS } from "./constants";

/** Registry of AI providers — adapter host. */
export class OmniProviderRegistry {
  providers: AiProvider[] = AI_PROVIDERS.map((p) => ({ ...p }));

  list(enabledOnly = false) {
    return enabledOnly ? this.providers.filter((p) => p.enabled) : [...this.providers];
  }

  get(id: AiProviderId) {
    return this.providers.find((p) => p.id === id) ?? null;
  }

  setStatus(id: AiProviderId, status: AiProvider["status"]) {
    const p = this.get(id);
    if (p) p.status = status;
    return p;
  }

  enable(id: AiProviderId, on = true) {
    const p = this.get(id);
    if (p) p.enabled = on;
    return p;
  }

  byPriority() {
    return [...this.providers].sort((a, b) => a.priority - b.priority);
  }
}

export const omniProviderRegistry = new OmniProviderRegistry();
