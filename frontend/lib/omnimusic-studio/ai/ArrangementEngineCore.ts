import type { GenerationWorkflowKind } from "../ai-types";

export class ArrangementEngineCore {
  sections(workflow: GenerationWorkflowKind, structure: string): string[] {
    if (structure.includes("-")) return structure.split("-");
    return workflow.includes("intro") ? ["Intro", "Main", "Outro"] : ["Section A", "Section B"];
  }
}

export const arrangementEngineCore = new ArrangementEngineCore();
