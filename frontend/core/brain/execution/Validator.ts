import type { BrainProcessResult } from "../types";

export type ValidationResult = {
  ok: boolean;
  issues: string[];
  improvements: string[];
};

/** Validates orchestration output before returning to user. */
export class ExecutionValidator {
  validate(result: Partial<BrainProcessResult>): ValidationResult {
    const issues: string[] = [];
    const improvements: string[] = [];

    if (!result.routed) issues.push("No tool route established");
    if (!result.intent) improvements.push("Low confidence — consider clarifying the request");
    if (result.plan && result.plan.subtasks.length > 6) {
      improvements.push("Large plan — subtasks will run in background");
    }

    return {
      ok: issues.length === 0,
      issues,
      improvements,
    };
  }
}
