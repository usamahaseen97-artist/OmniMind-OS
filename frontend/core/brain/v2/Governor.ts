import type { TaskResult } from "./DistributedTaskOrchestrator";

export type GovernedResponse = {
  response: string;
  ranked: { text: string; score: number }[];
  conflictsResolved: number;
  safe: boolean;
};

/** AI Governor — merge, rank, resolve conflicts, ensure safety. */
export class AIGovernor {
  merge(masterSummary: string, taskResults: TaskResult[], collaborationAnswers: string[]): GovernedResponse {
    const candidates = [
      { text: masterSummary, score: 95 },
      ...taskResults.map((r) => ({ text: r.output, score: r.ok ? 80 : 30 })),
      ...collaborationAnswers.map((a) => ({ text: a, score: 70 })),
    ].filter((c) => c.text.trim());

    const ranked = this.rankResponses(candidates);
    const conflictsResolved = this.detectConflicts(candidates);
    const safe = ranked.every((r) => r.score >= 30) && !this.hasUnsafeContent(ranked[0]?.text ?? "");

    const response = ranked
      .slice(0, 3)
      .map((r) => r.text)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    return {
      response: response || masterSummary,
      ranked,
      conflictsResolved,
      safe,
    };
  }

  private rankResponses(candidates: { text: string; score: number }[]) {
    return [...candidates].sort((a, b) => b.score - a.score);
  }

  private detectConflicts(candidates: { text: string; score: number }[]) {
    const tools = candidates.map((c) => c.text.match(/routed to (\S+)/i)?.[1]).filter(Boolean);
    return new Set(tools).size > 1 ? 1 : 0;
  }

  private hasUnsafeContent(text: string) {
    return /rm\s+-rf|drop\s+table|delete\s+all/i.test(text);
  }
}
