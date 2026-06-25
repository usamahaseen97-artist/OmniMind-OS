import { MODEL_PROVIDER_DESCRIPTORS } from "./constants";
import type {
  AIWorkflowKind,
  ModelProviderDescriptor,
  ModelProviderId,
} from "./types";

/** Provider adapter contract — implementations register at runtime; no hardcoded inference. */
export interface ModelProviderAdapter {
  readonly id: ModelProviderId;
  readonly label: string;
  readonly supportedWorkflows: AIWorkflowKind[];
  getStatus(): Promise<ModelProviderDescriptor["status"]>;
  /** Phase 2: returns routing metadata only; no real API calls. */
  prepareRoute(workflow: AIWorkflowKind): { providerId: ModelProviderId; modelHint: string };
}

class StubProviderAdapter implements ModelProviderAdapter {
  constructor(
    readonly id: ModelProviderId,
    readonly label: string,
    readonly supportedWorkflows: AIWorkflowKind[],
  ) {}

  async getStatus(): Promise<ModelProviderDescriptor["status"]> {
    return this.id === "omni-future" ? "unconfigured" : "available";
  }

  prepareRoute(workflow: AIWorkflowKind) {
    return {
      providerId: this.id,
      modelHint: `${this.id}:${workflow}:auto`,
    };
  }
}

/** Provider-independent model routing — selects adapter by workflow + preference. */
export class ModelRouter {
  private adapters = new Map<ModelProviderId, ModelProviderAdapter>();
  private preferredProvider: ModelProviderId | "auto" = "auto";

  constructor() {
    for (const desc of MODEL_PROVIDER_DESCRIPTORS) {
      this.register(
        new StubProviderAdapter(desc.id, desc.label, desc.workflows),
      );
    }
  }

  register(adapter: ModelProviderAdapter) {
    this.adapters.set(adapter.id, adapter);
  }

  setPreferredProvider(id: ModelProviderId | "auto") {
    this.preferredProvider = id;
  }

  getPreferredProvider() {
    return this.preferredProvider;
  }

  listProviders(): ModelProviderDescriptor[] {
    return MODEL_PROVIDER_DESCRIPTORS.map((d) => ({
      ...d,
      status: "available" as const,
    }));
  }

  async listProvidersWithStatus(): Promise<ModelProviderDescriptor[]> {
    const results: ModelProviderDescriptor[] = [];
    for (const desc of MODEL_PROVIDER_DESCRIPTORS) {
      const adapter = this.adapters.get(desc.id);
      const status = adapter ? await adapter.getStatus() : "offline";
      results.push({ ...desc, status });
    }
    return results;
  }

  resolve(workflow: AIWorkflowKind): { providerId: ModelProviderId; modelHint: string } {
    if (this.preferredProvider !== "auto") {
      const adapter = this.adapters.get(this.preferredProvider);
      if (adapter?.supportedWorkflows.includes(workflow)) {
        return adapter.prepareRoute(workflow);
      }
    }

    for (const desc of MODEL_PROVIDER_DESCRIPTORS) {
      if (!desc.workflows.includes(workflow)) continue;
      const adapter = this.adapters.get(desc.id);
      if (adapter) return adapter.prepareRoute(workflow);
    }

    const fallback = this.adapters.get("comfyui");
    return fallback?.prepareRoute(workflow) ?? { providerId: "local", modelHint: "local:fallback" };
  }

  providersForWorkflow(workflow: AIWorkflowKind): ModelProviderDescriptor[] {
    return MODEL_PROVIDER_DESCRIPTORS.filter((d) => d.workflows.includes(workflow)).map((d) => ({
      ...d,
      status: "available" as const,
    }));
  }
}

export const modelRouter = new ModelRouter();
