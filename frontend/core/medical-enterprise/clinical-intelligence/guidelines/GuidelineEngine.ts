import type { GuidelinePlugin, GuidelineReference } from "../types";

const BUILTIN_GUIDELINES: GuidelinePlugin[] = [
  {
    id: "hypertension-screening",
    name: "Hypertension Follow-up",
    version: "1.0.0",
    source: "OmniMind Clinical Plugin (template)",
    applicableWhen: (ctx) =>
      Array.isArray(ctx.pastDiagnoses) &&
      (ctx.pastDiagnoses as string[]).some((d) => /hypertension/i.test(d)),
    async retrieve() {
      return [
        {
          id: "htn-1",
          title: "Blood pressure monitoring",
          recommendation: "Consider regular BP monitoring and lifestyle counseling — clinician determines frequency.",
          evidenceLevel: "institutional-template",
          source: "builtin:hypertension-screening",
        },
      ];
    },
  },
  {
    id: "respiratory-symptoms",
    name: "Respiratory Symptom Evaluation",
    version: "1.0.0",
    source: "OmniMind Clinical Plugin (template)",
    applicableWhen: (ctx) =>
      Array.isArray(ctx.symptoms) &&
      (ctx.symptoms as string[]).some((s) => /cough|breath/i.test(s)),
    async retrieve() {
      return [
        {
          id: "resp-1",
          title: "Respiratory symptom workup",
          recommendation: "Directed history, vitals including SpO2, and clinician-directed testing as indicated.",
          evidenceLevel: "institutional-template",
          source: "builtin:respiratory-symptoms",
        },
      ];
    },
  },
];

/** Evidence-based guideline engine with plugin architecture */
export class GuidelineEngine {
  private plugins: GuidelinePlugin[] = [...BUILTIN_GUIDELINES];

  register(plugin: GuidelinePlugin) {
    this.plugins.push(plugin);
  }

  unregister(pluginId: string) {
    this.plugins = this.plugins.filter((p) => p.id !== pluginId);
  }

  listPlugins(): GuidelinePlugin[] {
    return [...this.plugins];
  }

  async retrieve(context: Record<string, unknown>): Promise<GuidelineReference[]> {
    const applicable = this.plugins.filter((p) => {
      try {
        return p.applicableWhen(context);
      } catch {
        return false;
      }
    });

    const results = await Promise.all(applicable.map((p) => p.retrieve(context)));
    return results.flat();
  }
}

let guidelineEngine: GuidelineEngine | null = null;

export function getGuidelineEngine(): GuidelineEngine {
  if (!guidelineEngine) guidelineEngine = new GuidelineEngine();
  return guidelineEngine;
}
