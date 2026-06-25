import type { TokenUsage } from "./types";

/** Token counting and budget tracking. */
export class OmniTokenManager {
  sessionUsage: TokenUsage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
  budgetLimit = 1_000_000;

  record(usage: TokenUsage) {
    this.sessionUsage = {
      inputTokens: this.sessionUsage.inputTokens + usage.inputTokens,
      outputTokens: this.sessionUsage.outputTokens + usage.outputTokens,
      totalTokens: this.sessionUsage.totalTokens + usage.totalTokens,
    };
    return this.sessionUsage;
  }

  remaining() {
    return Math.max(0, this.budgetLimit - this.sessionUsage.totalTokens);
  }

  withinBudget(estimated: number) {
    return this.sessionUsage.totalTokens + estimated <= this.budgetLimit;
  }

  reset() {
    this.sessionUsage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
  }
}

export const omniTokenManager = new OmniTokenManager();
