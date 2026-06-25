import type { CopilotSuggestion } from "./types";

export class CopilotEngine {
  analyze(projectName: string): CopilotSuggestion[] {
    return [
      { id: "s1", category: "improvement", message: `Optimize ${projectName} workflow — 3 steps can be parallelized.`, actionLabel: "Optimize" },
      { id: "s2", category: "missing-asset", message: "Missing hero thumbnail for YouTube publish.", actionLabel: "Generate" },
      { id: "s3", category: "publishing", message: "Schedule Instagram + TikTok within 2h for peak engagement.", actionLabel: "Schedule" },
      { id: "s4", category: "summary", message: `${projectName}: 78% pipeline complete, 2 approvals pending.`, actionLabel: null },
    ];
  }
}

export const copilotEngine = new CopilotEngine();
