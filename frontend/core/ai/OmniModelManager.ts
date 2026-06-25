import type { AiModel, AiModelCapability, AiProviderId } from "./types";
import { AI_MODELS } from "./constants";

/** Model catalog and availability. */
export class OmniModelManager {
  models: AiModel[] = AI_MODELS.map((m) => ({ ...m }));
  activeModelId = "gpt-4o";

  list(providerId?: AiProviderId, capability?: AiModelCapability) {
    return this.models.filter((m) => {
      if (providerId && m.providerId !== providerId) return false;
      if (capability && !m.capabilities.includes(capability)) return false;
      return true;
    });
  }

  get(id: string) {
    return this.models.find((m) => m.id === id) ?? null;
  }

  active() {
    return this.get(this.activeModelId) ?? this.models[0]!;
  }

  setActive(id: string) {
    if (this.get(id)) this.activeModelId = id;
    return this.active();
  }

  register(model: AiModel) {
    this.models.push(model);
    return model;
  }
}

export const omniModelManager = new OmniModelManager();
