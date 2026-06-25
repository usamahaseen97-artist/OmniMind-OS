import type { ReasoningStep } from "./types";

/** Multi-step reasoning pipeline architecture. */
export class OmniReasoningPipeline {
  steps: ReasoningStep[] = [];

  thought(content: string) {
    return this.push("thought", content);
  }

  action(content: string) {
    return this.push("action", content);
  }

  observation(content: string) {
    return this.push("observation", content);
  }

  conclude(content: string) {
    return this.push("conclusion", content);
  }

  private push(kind: ReasoningStep["kind"], content: string) {
    const step: ReasoningStep = {
      id: `rs-${Date.now()}`,
      kind,
      content,
      timestamp: new Date().toISOString(),
    };
    this.steps.push(step);
    return step;
  }

  reset() {
    this.steps = [];
  }

  trace() {
    return [...this.steps];
  }
}

export const omniReasoningPipeline = new OmniReasoningPipeline();
