import { MUSIC_PROVIDER_DESCRIPTORS } from "./constants";
import type {
  GenerationWorkflowKind,
  MusicProviderDescriptor,
  MusicProviderId,
} from "../ai-types";

export interface MusicProviderAdapter {
  readonly id: MusicProviderId;
  readonly label: string;
  readonly supportedWorkflows: GenerationWorkflowKind[];
  getStatus(): Promise<MusicProviderDescriptor["status"]>;
  prepareRoute(workflow: GenerationWorkflowKind): { providerId: MusicProviderId; modelHint: string };
}

class StubMusicAdapter implements MusicProviderAdapter {
  constructor(
    readonly id: MusicProviderId,
    readonly label: string,
    readonly supportedWorkflows: GenerationWorkflowKind[],
  ) {}

  async getStatus(): Promise<MusicProviderDescriptor["status"]> {
    return this.id === "omnimusic-future" ? "unconfigured" : "available";
  }

  prepareRoute(workflow: GenerationWorkflowKind) {
    return { providerId: this.id, modelHint: `${this.id}:${workflow}:architecture` };
  }
}

export class MusicModelRouter {
  private adapters = new Map<MusicProviderId, MusicProviderAdapter>();
  private preferred: MusicProviderId | "auto" = "auto";

  constructor() {
    for (const d of MUSIC_PROVIDER_DESCRIPTORS) {
      this.register(new StubMusicAdapter(d.id, d.label, d.workflows));
    }
  }

  register(adapter: MusicProviderAdapter) {
    this.adapters.set(adapter.id, adapter);
  }

  setPreferred(id: MusicProviderId | "auto") {
    this.preferred = id;
  }

  getPreferred() {
    return this.preferred;
  }

  listProviders(): MusicProviderDescriptor[] {
    return MUSIC_PROVIDER_DESCRIPTORS.map((d) => ({ ...d, status: "available" as const }));
  }

  async listWithStatus(): Promise<MusicProviderDescriptor[]> {
    const out: MusicProviderDescriptor[] = [];
    for (const d of MUSIC_PROVIDER_DESCRIPTORS) {
      const a = this.adapters.get(d.id);
      out.push({ ...d, status: a ? await a.getStatus() : "offline" });
    }
    return out;
  }

  resolve(workflow: GenerationWorkflowKind): { providerId: MusicProviderId; modelHint: string } {
    if (this.preferred !== "auto") {
      const a = this.adapters.get(this.preferred);
      if (a?.supportedWorkflows.includes(workflow)) return a.prepareRoute(workflow);
    }
    for (const d of MUSIC_PROVIDER_DESCRIPTORS) {
      const a = this.adapters.get(d.id);
      if (a?.supportedWorkflows.includes(workflow)) return a.prepareRoute(workflow);
    }
    return { providerId: "omnimusic-future", modelHint: `fallback:${workflow}` };
  }
}

export const musicModelRouter = new MusicModelRouter();
