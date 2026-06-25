import type { VoiceOverCategory, VoiceOverProject } from "../broadcast-types";
import { VOICEOVER_SEED } from "./constants";

export class VoiceOverCore {
  projects: VoiceOverProject[] = [...VOICEOVER_SEED];

  list(category?: VoiceOverCategory) {
    return category ? this.projects.filter((p) => p.category === category) : this.projects;
  }

  create(title: string, category: VoiceOverCategory, script: string): VoiceOverProject {
    const project: VoiceOverProject = {
      id: `vo-${Date.now()}`,
      title,
      category,
      script,
      durationSec: 0,
      status: "draft",
    };
    this.projects.unshift(project);
    return project;
  }

  update(id: string, patch: Partial<VoiceOverProject>) {
    const p = this.projects.find((x) => x.id === id);
    if (p) Object.assign(p, patch);
    return p ?? null;
  }
}

export const voiceOverCore = new VoiceOverCore();
