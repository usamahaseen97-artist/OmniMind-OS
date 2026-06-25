import type { BeatTemplate, GenerationWorkflowKind, MusicPromptSpec } from "../ai-types";
import { BEAT_TEMPLATES } from "./constants";
import { generationQueueEngine } from "./GenerationQueueEngine";
import { promptEngine } from "./PromptEngine";

export class ComposerEngine {
  readonly workflows: GenerationWorkflowKind[] = [
    "text-to-music",
    "lyrics-to-song",
    "melody-to-arrangement",
    "chords-to-song",
    "prompt-to-beat",
    "prompt-to-instrumental",
    "prompt-to-background",
    "prompt-to-intro",
    "prompt-to-outro",
    "prompt-to-trailer",
    "prompt-to-cinematic",
    "prompt-to-game",
    "prompt-to-podcast",
    "prompt-to-jingle",
  ];

  compose(projectId: string, spec: MusicPromptSpec) {
    const errors = promptEngine.validate(spec);
    if (errors.length) return { ok: false as const, errors, job: null };
    const job = generationQueueEngine.enqueue(projectId, spec);
    return { ok: true as const, errors: [], job };
  }

  fromBeatTemplate(projectId: string, template: BeatTemplate) {
    const spec = promptEngine.create({
      workflow: "prompt-to-beat",
      genre: template.genre,
      bpm: template.bpm,
      key: template.key,
      prompt: `${template.name} — ${template.pattern}`,
    });
    return this.compose(projectId, spec);
  }

  listBeatTemplates() {
    return BEAT_TEMPLATES;
  }
}

export const composerEngine = new ComposerEngine();
